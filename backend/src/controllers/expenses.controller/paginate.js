const entities = require("../../constants/entities");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../../services/crud.service");
const Expense = require("../../models/expense.model");

const paginate = async (req, res) => {
  const { skip, limit, filter, page, total, totalPages } =
    await getPaginationParams({
      req,
      modelName: entities.EXPENSES,
      model: Expense,
    });
  const expenses = await Expense.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("category")
    .exec();
  return res.status(200).json({
    data: expenses,
    currentPage: page,
    totalCount: total,
    totalPages,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "expenses",
    }),
  });
};

module.exports = paginate;
