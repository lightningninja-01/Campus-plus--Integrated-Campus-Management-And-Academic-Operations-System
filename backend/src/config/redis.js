const { createClient } = require("redis");

let redisClient = null;
let isRedisConnectedFlag = false;
const fallbackMemoryCache = new Map();

// Helper in-memory mock client that mimics the redis client interface
const memoryClientMock = {
  async connect() {
    return this;
  },
  async get(key) {
    const entry = fallbackMemoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      fallbackMemoryCache.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key, value, options = {}) {
    let expiresAt = null;
    if (options.EX) {
      expiresAt = Date.now() + options.EX * 1000;
    }
    fallbackMemoryCache.set(key, { value, expiresAt });
    return "OK";
  },
  async del(key) {
    let deletedCount = 0;
    if (key.includes("*")) {
      const regex = new RegExp("^" + key.replace(/\*/g, ".*") + "$");
      for (const k of fallbackMemoryCache.keys()) {
        if (regex.test(k)) {
          fallbackMemoryCache.delete(k);
          deletedCount++;
        }
      }
    } else {
      if (fallbackMemoryCache.has(key)) {
        fallbackMemoryCache.delete(key);
        deletedCount = 1;
      }
    }
    return deletedCount;
  },
  async keys(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const results = [];
    for (const k of fallbackMemoryCache.keys()) {
      if (regex.test(k)) {
        const entry = fallbackMemoryCache.get(k);
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          fallbackMemoryCache.delete(k);
        } else {
          results.push(k);
        }
      }
    }
    return results;
  },
  on() {
    return this;
  }
};

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  
  console.log(`[Cache] Attempting to connect to Redis at ${redisUrl}...`);
  
  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 3000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.warn("[Cache] Redis connection failed after retries. Switching to in-memory fallback cache.");
          isRedisConnectedFlag = false;
          redisClient = memoryClientMock;
          return new Error("Max reconnection attempts reached");
        }
        return Math.min(retries * 500, 2000);
      }
    }
  });

  redisClient.on("error", (err) => {
    console.warn("[Cache] Redis Client Error:", err.message);
  });

  redisClient.on("ready", () => {
    isRedisConnectedFlag = true;
    console.log("[Cache] Redis Client Connected Successfully");
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.warn("[Cache] Could not establish initial connection to Redis. Falling back to in-memory cache.");
    redisClient = memoryClientMock;
    isRedisConnectedFlag = false;
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    return memoryClientMock;
  }
  return redisClient;
};

module.exports = {
  initRedis,
  getRedisClient,
  isRedisConnected: () => isRedisConnectedFlag
};
