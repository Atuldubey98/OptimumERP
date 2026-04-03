const ProductCategory = require("../models/productCategory.model");
const logger = require("../logger");
const cacheService = require("./cache.service");

const PRODUCT_CATEGORY_CACHE_SCOPE = "productCategory";
const PRODUCT_CATEGORY_LIST_CACHE_TTL_SECONDS = Number(
  process.env.PRODUCT_CATEGORY_CACHE_TTL_SECONDS || 20 * 60,
);

const buildOrgProductCategoryListCacheKey = (orgId) =>
  cacheService.buildKey(PRODUCT_CATEGORY_CACHE_SCOPE, "list", orgId);

const getProductCategoryListForOrg = async (orgId) => {
  const key = buildOrgProductCategoryListCacheKey(orgId);
  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Product category cache miss for org ${orgId}; reading from DB`);
      return ProductCategory.find({ org: orgId }).sort({ createdAt: -1 }).lean().exec();
    },
    {
      ttl: PRODUCT_CATEGORY_LIST_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`Product category cache hit for org ${orgId}`);
      },
    },
  );
};

const invalidateProductCategoryCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all product category cache entries");
    return cacheService.invalidateScope(PRODUCT_CATEGORY_CACHE_SCOPE);
  }

  logger.debug(`Invalidating product category cache for org ${orgId}`);
  return cacheService.del(buildOrgProductCategoryListCacheKey(orgId));
};

module.exports = {
  getProductCategoryListForOrg,
  invalidateProductCategoryCache,
};