const Expense = require("../models/expense.model");
const Transaction = require("../models/transaction.model");
const OrgModel = require("../models/org.model");
const settingService = require("./setting.service");
const { executeMongoDbTransaction } = require("./crud.service");
const { OrgNotFound } = require("../errors/org.error");
const logger = require("../logger");

const createExpense = async (data) => {
  return await executeMongoDbTransaction(async (session) => {
    const expense = new Expense(data);
    await expense.save({ session });

    const setting = await settingService.getDetailedSettingForOrg(data.org, session);
    if (!setting) throw new OrgNotFound();

    const transaction = new Transaction({
      org: data.org,
      createdBy: data.createdBy,
      docModel: "expense",
      financialYear: setting.financialYear,
      doc: expense._id,
      total: data.amount,
      date: data.date || new Date(),
    });

    await transaction.save({ session });
    logger.info(`expense created ${expense.id}`);

    await OrgModel.updateOne(
      { _id: data.org },
      { $inc: { "relatedDocsCount.expenses": 1 } },
      { session }
    );
    return expense;
  });
};

const updateExpense = async (filter, data) => {
  return await executeMongoDbTransaction(async (session) => {
    const expense = await Expense.findOneAndUpdate(filter, data, {
      new: true,
      session,
    });

    if (!expense) return null;

    await Transaction.updateOne(
      { doc: expense._id, org: filter.org },
      {
        total: data.amount,
        date: data.date,
      },
      { session }
    );

    logger.info(`expense updated ${expense.id}`);
    return expense;
  });
};

const getExpenseDetail = async (filter) => {
  return await Expense.findOne(filter).populate("category").lean();
};

module.exports = {
  createExpense,
  updateExpense,
  getExpenseDetail,
};
