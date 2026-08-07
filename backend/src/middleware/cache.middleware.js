const { getRedisClient } = require("../config/redis");

/**
 * Cache middleware to cache Express JSON responses in Redis (or in-memory fallback)
 * @param {Object} options Configuration options
 * @param {Number} options.ttl Time to live in seconds (default 300s / 5m)
 * @param {String} options.keyPrefix Prefix for the cache key
 * @param {Function} options.keyBuilder Function to generate the cache key suffix from request
 */
const cacheMiddleware = (options = {}) => {
  const { ttl = 300, keyPrefix = "cache", keyBuilder } = options;

  return async (req, res, next) => {
    try {
      const redisClient = getRedisClient();
      
      // Determine the unique cache key suffix
      let suffix = "";
      if (typeof keyBuilder === "function") {
        suffix = await keyBuilder(req);
      } else {
        suffix = req.originalUrl || req.url;
      }
      
      const cacheKey = `${keyPrefix}:${suffix}`;
      
      // Try to read from cache
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedData));
      }

      // Cache miss: override res.json to capture response
      res.setHeader("X-Cache", "MISS");
      const originalJson = res.json;
      
      res.json = function (body) {
        res.json = originalJson;
        
        // Cache success responses asynchronously
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, JSON.stringify(body), { EX: ttl }).catch((err) => {
            console.error(`[Cache] Error setting cache key ${cacheKey}:`, err.message);
          });
        }
        
        return res.json(body);
      };
      
      next();
    } catch (error) {
      console.error("[Cache] Middleware Error:", error.message);
      next();
    }
  };
};

/**
 * Utility to clear all cache keys matching a pattern (e.g. notices:*)
 * @param {String} pattern Glob pattern (e.g. "notices:*")
 */
const clearCachePattern = async (pattern) => {
  try {
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      for (const key of keys) {
        await redisClient.del(key);
      }
      console.log(`[Cache] Cleared cache pattern "${pattern}" (${keys.length} keys deleted)`);
    }
  } catch (error) {
    console.error(`[Cache] Error clearing cache pattern "${pattern}":`, error.message);
  }
};

module.exports = {
  cacheMiddleware,
  clearCachePattern
};
