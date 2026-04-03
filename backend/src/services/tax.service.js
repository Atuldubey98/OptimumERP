const Tax = require("../models/tax.model");
const logger = require("../logger");
const cacheService = require("./cache.service");

const TAX_CACHE_SCOPE = "tax";
const TAX_LIST_CACHE_TTL_SECONDS = Number(process.env.TAX_CACHE_TTL_SECONDS || 10 * 60);

const buildOrgTaxListCacheKey = (orgId) =>
  cacheService.buildKey(TAX_CACHE_SCOPE, "list", orgId);

const getTaxListForOrg = async (orgId) => {
  const key = buildOrgTaxListCacheKey(orgId);
  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Tax cache miss for org ${orgId}; reading from DB`);
      return Tax.find({ org: orgId }).populate("children").lean().exec();
    },
    {
      ttl: TAX_LIST_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`Tax cache hit for org ${orgId}`);
      },
    },
  );
};

const getTaxMapForOrgByIds = async (orgId, taxIds = []) => {
  const normalizedTaxIds = [...new Set(taxIds.filter(Boolean).map(String))];
  if (!normalizedTaxIds.length) return {};

  const taxes = await getTaxListForOrg(orgId);
  return taxes.reduce((acc, tax) => {
    if (normalizedTaxIds.includes(String(tax._id))) {
      acc[tax._id] = tax;
    }
    return acc;
  }, {});
};

const invalidateTaxCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all tax cache entries");
    return cacheService.invalidateScope(TAX_CACHE_SCOPE);
  }

  logger.debug(`Invalidating tax cache for org ${orgId}`);
  return cacheService.del(buildOrgTaxListCacheKey(orgId));
};

module.exports = {
  getTaxListForOrg,
  getTaxMapForOrgByIds,
  invalidateTaxCache,
};