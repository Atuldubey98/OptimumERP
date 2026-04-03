const ExpenseCategory = require("../models/expenseCategory.model");
const logger = require("../logger");
const cacheService = require("./cache.service");

const EXPENSE_CATEGORY_CACHE_SCOPE = "expenseCategory";
const EXPENSE_CATEGORY_LIST_CACHE_TTL_SECONDS = Number(
  process.env.EXPENSE_CATEGORY_CACHE_TTL_SECONDS || 20 * 60,
);

const buildOrgExpenseCategoryListCacheKey = (orgId) =>
  cacheService.buildKey(EXPENSE_CATEGORY_CACHE_SCOPE, "list", orgId);

const getExpenseCategoryListForOrg = async (orgId) => {
  const key = buildOrgExpenseCategoryListCacheKey(orgId);
  return cacheService.getOrSet(
    key,
    async () => {
      logger.debug(`Expense category cache miss for org ${orgId}; reading from DB`);
      return ExpenseCategory.find({ org: orgId }).lean().exec();
    },
    {
      ttl: EXPENSE_CATEGORY_LIST_CACHE_TTL_SECONDS,
      onHit: () => {
        logger.debug(`Expense category cache hit for org ${orgId}`);
      },
    },
  );
};

const invalidateExpenseCategoryCache = (orgId) => {
  if (!orgId) {
    logger.debug("Invalidating all expense category cache entries");
    return cacheService.invalidateScope(EXPENSE_CATEGORY_CACHE_SCOPE);
  }

  logger.debug(`Invalidating expense category cache for org ${orgId}`);
  return cacheService.del(buildOrgExpenseCategoryListCacheKey(orgId));
};

module.exports = {
  getExpenseCategoryListForOrg,
  invalidateExpenseCategoryCache,
};