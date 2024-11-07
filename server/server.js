const express = require("express");
const axios = require("axios");

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL of 1 hour

const app = express();
const PORT = process.env.PORT || 3000;

const REST_COUNTRIES_API = "https://restcountries.com/v3.1";
function checkCache(req, res, next) {
  const key = req.originalUrl;
  if (cache.has(key)) {
    return res.json(cache.get(key));
  }
  next();
}

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.get("/countries", checkCache, async (req, res) => {
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/all`);
    const data = response.data.map((country) => ({
      name: country.name.common,
      population: country.population,
      flag: country.flags.svg,
      region: country.region,
      code:country.cca2,
      currency: country.currencies

        ? Object.keys(country.currencies).join(", ")
        : "N/A",
    }));
    console.log(data.length);
    cache.set("/countries", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch countries data" });
  }
});

app.get("/countriescode/:code", checkCache, async (req, res) => {
  const { code } = req.params;
  console.log("cpde",code);
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/alpha/${code}`);
    cache.set(`/countries/${code}`, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: `Country with code ${code} not found` });
  }
});

app.get("/countries/region/:region", checkCache, async (req, res) => {
  const { region } = req.params;
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/region/${region}`);
    cache.set(`/countries/region/${region}`, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch countries by region" });
  }
});

app.get("/countries/search", checkCache, async (req, res) => {
  const { name, capital, region, timezone } = req.query;
  console.log(name, capital, region, timezone );
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/all`);
    let data = response.data;

    if (name) {
      data = data.filter((country) =>
        country.name.common.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (capital) {
      data = data.filter(
        (country) =>
          country.capital &&
          country.capital[0].toLowerCase().includes(capital.toLowerCase())
      );
    }
    if (region) {
      data = data.filter(
        (country) => country.region.toLowerCase() === region.toLowerCase()
      );
    }
    if (timezone) {
      data = data.filter(
        (country) => country.timezones && country.timezones.includes(timezone)
      );
    }

    if (!data.length) {
      return res
        .status(404)
        .json({ error: "No countries found matching the criteria" });
    }

    cache.set(req.originalUrl, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to search countries" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
