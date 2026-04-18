const { OrgNotFound } = require("../errors/org.error");
const logger = require("../logger");
const Setting = require("../models/settings.model");
const cacheService = require("./cache.service");

const SETTING_CACHE_SCOPE = "setting";
const DISPLAY_SETTING_CACHE_TTL_SECONDS = Number(
  process.env.SETTING_DISPLAY_CACHE_TTL_SECONDS || 10 * 60,
);
const DETAILED_SETTING_CACHE_TTL_SECONDS = Number(
  process.env.SETTING_DETAILED_CACHE_TTL_SECONDS || DISPLAY_SETTING_CACHE_TTL_SECONDS,
);

const buildDisplaySettingCacheKey = (orgId) =>
  cacheService.buildKey(SETTING_CACHE_SCOPE, "display", orgId);

const buildDetailedSettingCacheKey = (orgId) =>
  cacheService.buildKey(SETTING_CACHE_SCOPE, "detailed", orgId);

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

const getDetailedSettingForOrg = async (orgId) => {
  const key = buildDetailedSettingCacheKey(orgId);

  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Detailed setting cache miss for org ${orgId}; reading from DB`);
      const setting = await Setting.findOne({ org: orgId })
        .populate("org")
        .populate("receiptDefaults.tax")
        .populate("receiptDefaults.um")
        .lean()
        .exec();
      if (!setting) {
        logger.error(`No settings found for OrgID: ${orgId}`);
        throw new OrgNotFound();
      }

      return setting;
    },
    {
      ttl: DETAILED_SETTING_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`Detailed setting cache hit for org ${orgId}`);
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
  return cacheService.del([
    buildDisplaySettingCacheKey(orgId),
    buildDetailedSettingCacheKey(orgId),
  ]);
};

module.exports = {
  getDetailedSettingForOrg,
  getDisplaySettingForOrg,
  invalidateSettingCache,
};