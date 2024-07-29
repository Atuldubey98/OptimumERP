const {
  ExpenseCategoryNotDeleted,
  ExpenseCategoryNotFound,
} = require("../../errors/expenseCategory.error");
const logger = require("../../logger");
const Expense = require("../../models/expense.model");
const ExpenseCategory = require("../../models/expenseCategory.model");
const OrgModel = require("../../models/org.model");

const remove = async (req, res) => {
  const expense = await Expense.findOne({
    org: req.params.orgId,
    category: req.params.categoryId,
  });
  if (expense) {
    logger.warn(`Expense category not deleted`);
    throw new ExpenseCategoryNotDeleted({
      reason: "Expense category linked to expense",
    });
  }
  const category = await ExpenseCategory.findOneAndDelete({
    org: req.params.orgId,
    _id: req.params.categoryId,
  }).lean();
  if (!category) throw new ExpenseCategoryNotFound();
  logger.info(`deleted expense category ${category.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenseCategories": -1 } }
  );
  return res.status(200).json({ data: category });
};
module.exports = remove;
