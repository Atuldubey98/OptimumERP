const Template = require("../models/template.model");
const logger = require("../logger");
const cacheService = require("./cache.service");

const TEMPLATE_CACHE_SCOPE = "template";
const TEMPLATE_CACHE_TTL_SECONDS = Number(
  process.env.TEMPLATE_CACHE_TTL_SECONDS || 10 * 60
);

const buildOrgTemplateListCacheKey = (orgId, type) =>
  cacheService.buildKey(TEMPLATE_CACHE_SCOPE, "list", orgId, type || "all");

const getTemplateListForOrg = async (orgId, type) => {
  const key = buildOrgTemplateListCacheKey(orgId, type);
  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(
        `Template cache miss for org ${orgId} type=${type || "all"}; reading from DB`
      );
      const filter = { org: orgId };
      if (type) {
        filter.type = type;
      }
      return Template.find(filter).sort({ createdAt: -1 }).lean().exec();
    },
    {
      ttl: TEMPLATE_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(
          `Template cache hit for org ${orgId} type=${type || "all"}`
        );
      },
    }
  );
};

const invalidateTemplateCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all template cache entries");
    return cacheService.invalidateScope(TEMPLATE_CACHE_SCOPE);
  }

  logger.debug(`Invalidating template cache for org ${orgId}`);
  return cacheService.delByPrefix(
    cacheService.buildKey(TEMPLATE_CACHE_SCOPE, "list", orgId)
  );
};

module.exports = {
  getTemplateListForOrg,
  invalidateTemplateCache,
};
