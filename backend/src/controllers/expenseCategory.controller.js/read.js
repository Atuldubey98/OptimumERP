const {
  ExpenseCategoryNotFound,
} = require("../../errors/expenseCategory.error");
const ExpenseCategory = require("../../models/expenseCategory.model");

const read = async (req, res) => {
  const expenseCategory = await ExpenseCategory.findOne({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  if (!expenseCategory) throw new ExpenseCategoryNotFound();
  return res.status(200).json({ data: expenseCategory });
};

module.exports = read;
