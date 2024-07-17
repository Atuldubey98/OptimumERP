const { hasUserReachedCreationLimits } = require("../../services/crud.service");
const ExpenseCategory = require("../../models/expenseCategory.model");

const paginate = async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };
  const categories = await ExpenseCategory.find(filter);
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
