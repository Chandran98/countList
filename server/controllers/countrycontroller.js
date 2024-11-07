const { default: axios } = require("axios");
const asyncHandler = require("express-async-handler");
const REST_COUNTRIES_API = "https://restcountries.com/v3.1";

const NodeCache = require("node-cache");
const { checkCache } = require("../middleware/cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL of 1 hour
const getAllCountries = (checkCache, asyncHandler(async (req, res) => {
  
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/all`);
    const data = response.data.map((country) => ({
      name: country.name.common,
      population: country.population,
      flag: country.flags.svg,
      region: country.region,
      currency: country.currencies
        ? Object.keys(country.currencies).join(", ")
        : "N/A",
    }));
    console.log(data.length);
    cache.set("/countries", data);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch countries data ${}" });
  }
}));

const getCountriesCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/alpha/${code}`);
    cache.set(`/countries/${code}`, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: `Country with code ${code} not found` });
  }
});

const searchCountries = asyncHandler(async (req, res) => {
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

const getCountriesbyregion = asyncHandler(async (req, res) => {
  const { region } = req.params;
  try {
    const response = await axios.get(`${REST_COUNTRIES_API}/region/${region}`);
    cache.set(`/countries/region/${region}`, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch countries by region" });
  }
});

module.exports = {
  getAllCountries,
  getCountriesCode,
  getCountriesbyregion,
  searchCountries,
};