const { ExpenseNotFound } = require("../../errors/expense.error");
const logger = require("../../logger");
const Expense = require("../../models/expense.model");
const Transaction = require("../../models/transaction.model");

const update = async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) throw new ExpenseNotFound();
  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: expenseId, org: req.params.orgId },
    req.body,
    {
      new: true,
    }
  );

  const updateTransaction = await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "expense",
      doc: updatedExpense._id,
    },
    { updatedBy: req.body.updatedBy, ...req.body }
  );
  if (!updatedExpense || !updateTransaction) throw new ExpenseNotFound();
  logger.info(`expense category updated ${updatedExpense.id}`);
  res.status(200).json(updatedExpense);
};

module.exports = update;
