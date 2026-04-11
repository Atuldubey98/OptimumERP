const ExpenseCategory = require("../models/expenseCategory.model");
const logger = require("../logger");
const cacheService = require("./cache.service");
const { executeMongoDbTransaction } = require("./crud.service");
const OrgModel = require("../models/org.model");
const Expense = require("../models/expense.model");
const { ExpenseCategoryNotFound } = require("../errors/expenseCategory.error");

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
      logger.debug(
        `Expense category cache miss for org ${orgId}; reading from DB`,
      );
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
const create = async (data) => {
  const category = await executeMongoDbTransaction(async (session) => {
    const category = new ExpenseCategory(data);
    await category.save({ session });
    logger.info(`created expense category ${category.id}`);
    await changeOrgExpCategoryCount(data.orgs, session, 1);
  });
  return category;
};
const read = async (filter) => {
  const expenseCategory = await ExpenseCategory.findOne(filter);
  if (!expenseCategory) throw new ExpenseCategoryNotFound();
  return expenseCategory;
};
const remove = async (filter) => {
  const category = await executeMongoDbTransaction(async (session) => {
    const category = await ExpenseCategory.softDelete(filter, {session}).lean();
    if (!category) throw new ExpenseCategoryNotFound();
    logger.info(`deleted expense category ${category.id}`);
    await changeOrgExpCategoryCount(filter.org, session, -1);
    return category;
  });
  return category;
}
const findLinkedExepense = async (categoryId, orgId) => {
  const expense = await Expense.findOne({
    org: orgId,
    category: categoryId,
  }).lean();
  return expense;
}
async function changeOrgExpCategoryCount(org, session, incrementBy = 1) {
  await OrgModel.updateOne(
    { _id: org },
    { $inc: { "relatedDocsCount.expenseCategories": incrementBy } },
    { session },
  );
}
const update = async (filter, data) => {
  const category = await ExpenseCategory.findOneAndUpdate(
    {
      org: filter.org,
      _id: filter._id,
    },
    data,
    {
      new: true,
    }
  ).lean().exec();
  logger.info(`updated expense category ${category.id}`);
  if (!category) throw new ExpenseCategoryNotFound();
  return category
}
module.exports = {
  getExpenseCategoryListForOrg,
  invalidateExpenseCategoryCache,
  create,
  read,
  remove,
  findLinkedExepense,
  update,
};