const { OrgNotFound } = require("../errors/org.error");
const logger = require("../logger");
const Setting = require("../models/settings.model");
const cacheService = require("./cache.service");

const SETTING_CACHE_SCOPE = "setting";
const DISPLAY_SETTING_CACHE_TTL_SECONDS = Number(
  process.env.SETTING_DISPLAY_CACHE_TTL_SECONDS || 10 * 60,
);

const buildDisplaySettingCacheKey = (orgId) =>
  cacheService.buildKey(SETTING_CACHE_SCOPE, "display", orgId);

const getDisplaySettingForOrg = async (orgId) => {
  const key = buildDisplaySettingCacheKey(orgId);

  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Setting cache miss for org ${orgId}; reading from DB`);

      const setting = await Setting.findOne({ org: orgId }).lean().exec();
      if (!setting) throw new OrgNotFound();

      return setting;
    },
    {
      ttl: DISPLAY_SETTING_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`Setting cache hit for org ${orgId}`);
      },
    },
  );
};

const invalidateSettingCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all setting cache entries");
    return cacheService.invalidateScope(SETTING_CACHE_SCOPE);
  }

  logger.debug(`Invalidating setting cache for org ${orgId}`);
  return cacheService.del(buildDisplaySettingCacheKey(orgId));
};

module.exports = {
  getDisplaySettingForOrg,
  invalidateSettingCache,
};