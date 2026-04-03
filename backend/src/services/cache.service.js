const NodeCache = require("node-cache");
const logger = require("../logger");

const CACHE_ENABLED = process.env.CACHE_ENABLED !== "false";
const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_DEFAULT_TTL_SECONDS || 300);
const CHECK_PERIOD_SECONDS = Number(process.env.CACHE_CHECK_PERIOD_SECONDS || 120);

const TTL = Object.freeze({
  short: 30,
  medium: 5 * 60,
  long: 30 * 60,
  veryLong: 12 * 60 * 60,
});

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: CHECK_PERIOD_SECONDS,
  useClones: true,
  deleteOnExpire: true,
});

const normalizeKeyPart = (part) => {
  if (part === undefined || part === null || part === "") return "_";
  if (typeof part === "object") return JSON.stringify(part);
  return String(part);
};

const buildKey = (...parts) => parts.map(normalizeKeyPart).join(":");

const isEnabled = () => CACHE_ENABLED;

const get = (key) => {
  if (!CACHE_ENABLED) return undefined;
  return cache.get(key);
};

const getMany = (keys = []) => {
  if (!CACHE_ENABLED || !Array.isArray(keys) || !keys.length) return {};
  return cache.mget(keys);
};

const set = (key, value, ttl = DEFAULT_TTL_SECONDS) => {
  if (!CACHE_ENABLED) return value;
  cache.set(key, value, ttl);
  return value;
};

const setMany = (entries = [], ttl = DEFAULT_TTL_SECONDS) => {
  if (!CACHE_ENABLED || !Array.isArray(entries) || !entries.length) return false;
  return cache.mset(
    entries.map(({ key, value }) => ({
      key,
      value,
      ttl,
    })),
  );
};

const has = (key) => {
  if (!CACHE_ENABLED) return false;
  return cache.has(key);
};

const del = (keys) => {
  if (!CACHE_ENABLED) return 0;
  const normalizedKeys = Array.isArray(keys) ? keys : [keys];
  return cache.del(normalizedKeys);
};

const delByPrefix = (prefix) => {
  if (!CACHE_ENABLED || !prefix) return 0;
  const matchingKeys = cache.keys().filter((key) => key.startsWith(prefix));
  if (!matchingKeys.length) return 0;
  return cache.del(matchingKeys);
};

const flush = () => {
  if (!CACHE_ENABLED) return;
  cache.flushAll();
};

const getStats = () => {
  if (!CACHE_ENABLED) {
    return {
      enabled: false,
      keys: 0,
      hits: 0,
      misses: 0,
      ksize: 0,
      vsize: 0,
    };
  }

  return {
    enabled: true,
    ...cache.getStats(),
  };
};

const getOrSet = async (
  key,
  factory,
  {
    ttl = DEFAULT_TTL_SECONDS,
    cacheUndefined = false,
    cacheNull = false,
    onHit,
    onMiss,
  } = {},
) => {
  if (!CACHE_ENABLED) {
    return factory();
  }

  const cachedValue = cache.get(key);
  if (cachedValue !== undefined) {
    if (typeof onHit === "function") onHit(key, cachedValue);
    return cachedValue;
  }

  if (typeof onMiss === "function") onMiss(key);

  const freshValue = await factory();
  const shouldSkipCaching =
    (freshValue === undefined && !cacheUndefined) ||
    (freshValue === null && !cacheNull);

  if (!shouldSkipCaching) {
    cache.set(key, freshValue, ttl);
  }

  return freshValue;
};

const wrap = async (scope, keyParts, factory, options = {}) => {
  const key = Array.isArray(keyParts)
    ? buildKey(scope, ...keyParts)
    : buildKey(scope, keyParts);
  return getOrSet(key, factory, options);
};

const invalidateScope = (scope, ...parts) => delByPrefix(buildKey(scope, ...parts));

cache.on("expired", (key) => {
  logger.debug(`Cache expired: ${key}`);
});

module.exports = {
  TTL,
  cache,
  isEnabled,
  buildKey,
  get,
  getMany,
  set,
  setMany,
  has,
  del,
  delByPrefix,
  flush,
  getStats,
  getOrSet,
  wrap,
  invalidateScope,
};