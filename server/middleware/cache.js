
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL of 1 hour

function checkCache(req, res, next) {
    const key = req.originalUrl;


    console.log(key,"key");
    if (cache.has(key)) {
      return res.json(cache.get(key));
    }
    // next();
  }

  module.exports = {
    checkCache
  };