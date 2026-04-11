const { ExpenseNotFound } = require("../../errors/expense.error");
const { OrgNotFound } = require("../../errors/org.error");
const logger = require("../../logger");
const Expense = require("../../models/expense.model");
const Transaction = require("../../models/transaction.model");
const OrgModel = require("../../models/org.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const settingService = require("../../services/setting.service");

const update = async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) throw new ExpenseNotFound();

  await executeMongoDbTransaction(async (session) => {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: expenseId, org: req.params.orgId },
      req.body,
      { new: true, session }
    );

    if (!updatedExpense) throw new ExpenseNotFound();

    const setting = await settingService.getDetailedSettingForOrg(
      req.params.orgId,
      session
    );
    if (!setting) throw new OrgNotFound();

    const updateTransaction = await Transaction.findOneAndUpdate(
      {
        org: req.params.orgId,
        docModel: "expense",
        doc: updatedExpense._id,
      },
      { 
        updatedBy: req.body.updatedBy, 
        ...req.body,
        financialYear: setting.financialYear 
      },
      { new: true, session }
    );

    if (!updateTransaction) throw new ExpenseNotFound();

    logger.info(`expense updated ${updatedExpense.id}`);
    return res.status(200).json(updatedExpense);
  });
};

module.exports = update;
