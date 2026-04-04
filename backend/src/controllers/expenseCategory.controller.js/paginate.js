const { hasUserReachedCreationLimits } = require("../../services/crud.service");
const ExpenseCategory = require("../../models/expenseCategory.model");
const { getExpenseCategoryListForOrg } = require("../../services/expenseCategory.service");

const paginate = async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };
  const shouldUseCachedOrgExpenseCategoryList = !search;
  const categories = shouldUseCachedOrgExpenseCategoryList
    ? await getExpenseCategoryListForOrg(req.params.orgId)
    : await ExpenseCategory.find(filter).lean();
  return res.status(200).json({
    data: categories,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "expenseCategories",
    }),
  });
};
module.exports = paginate;
