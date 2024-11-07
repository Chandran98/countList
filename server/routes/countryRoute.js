const express = require("express");
const { checkCache } = require("../middleware/cache");

const {
  getAllCountries,
  searchCountries,
  getCountriesbyregion,
  getCountriesCode,
} = require("../controllers/countrycontroller");
const router = express.Router();
router.route("/countries").get(getAllCountries);

router.route("/countries/:code").get(checkCache, getCountriesCode);

router.route("/countries/region/:region").get(checkCache, getCountriesbyregion);
router.route("/countries/search").get(checkCache, searchCountries);
module.exports = router;
