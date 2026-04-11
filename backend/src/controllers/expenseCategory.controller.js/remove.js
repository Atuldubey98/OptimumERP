const {
  ExpenseCategoryNotDeleted,
} = require("../../errors/expenseCategory.error");
const logger = require("../../logger");
const expenseCategorService = require("../../services/expenseCategory.service");

const remove = async (req, res) => {
  const expense = await expenseCategorService.findLinkedExepense(
    req.params.categoryId,
    req.params.orgId
  );
  if (expense) {
    logger.warn(`Expense category not deleted`);
    throw new ExpenseCategoryNotDeleted({
      reason: "Expense category linked to expense",
    });
  }
  const category = await expenseCategorService.remove({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  expenseCategorService.invalidateExpenseCategoryCache(req.params.orgId);
  return res.status(200).json({ data: category });
};
module.exports = remove;
