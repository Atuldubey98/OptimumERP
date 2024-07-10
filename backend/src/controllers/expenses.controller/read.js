const Expense = require("../../models/expense.model");
const { ExpenseNotFound } = require("../../errors/expense.error");
const read = async (req, res) => {
  const expense = await Expense.findOne({
    org: req.params.orgId,
    _id: req.params.expenseId,
  });
  if (!expense) throw new ExpenseNotFound();
  return res.status(200).json({ data: expense });
};

module.exports = read;
