const { ExpenseNotFound } = require("../../errors/expense.error");
const logger = require("../../logger");
const Expense = require("../../models/expense.model");
const OrgModel = require("../../models/org.model");
const Transaction = require("../../models/transaction.model");

const remove = async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) throw new ExpenseNotFound();
  const deletedExpense = await Expense.softDelete({
    _id: expenseId,
    org: req.params.orgId,
  });

  if (!deletedExpense) throw new ExpenseNotFound();
  const transaction = await Transaction.softDelete({
    org: req.params.orgId,
    docModel: "expense",
    doc: expenseId,
  });
  if (!transaction) throw new ExpenseNotFound();
  logger.info(`expense category deleted ${deletedExpense.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenses": -1 } }
  );
  return res.status(200).json({ message: "Expense deleted successfully" });
};

module.exports = remove;
