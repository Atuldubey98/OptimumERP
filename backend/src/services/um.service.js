const Um = require("../models/um.model");
const logger = require("../logger");
const cacheService = require("./cache.service");

const UM_CACHE_SCOPE = "um";
const UM_LIST_CACHE_TTL_SECONDS = Number(
  process.env.UM_CACHE_TTL_SECONDS || 30 * 60,
);

const buildOrgUmListCacheKey = (orgId) =>
  cacheService.buildKey(UM_CACHE_SCOPE, "list", orgId);

const getUmListForOrg = async (orgId) => {
  const key = buildOrgUmListCacheKey(orgId);
  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`UM cache miss for org ${orgId}; reading from DB`);
      return Um.find({ org: orgId }).lean().exec();
    },
    {
      ttl: UM_LIST_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`UM cache hit for org ${orgId}`);
      },
    },
  );
};

const getUmMapForOrgByIds = async (orgId, umIds = []) => {
  const normalizedUmIds = [...new Set(umIds.filter(Boolean).map(String))];
  if (!normalizedUmIds.length) return {};

  const ums = await getUmListForOrg(orgId);
  return ums.reduce((acc, um) => {
    if (normalizedUmIds.includes(String(um._id))) {
      acc[um._id] = um;
    }
    return acc;
  }, {});
};

const invalidateUmCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all UM cache entries");
    return cacheService.invalidateScope(UM_CACHE_SCOPE);
  }

  logger.debug(`Invalidating UM cache for org ${orgId}`);
  return cacheService.del(buildOrgUmListCacheKey(orgId));
};

module.exports = {
  getUmListForOrg,
  getUmMapForOrgByIds,
  invalidateUmCache,
};
