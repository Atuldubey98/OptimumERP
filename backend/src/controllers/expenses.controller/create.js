const { expenseDto } = require("../../dto/expense.dto.js");
const { OrgNotFound } = require("../../errors/org.error.js");
const logger = require("../../logger.js");
const Expense = require("../../models/expense.model.js");
const OrgModel = require("../../models/org.model.js");
const Transaction = require("../../models/transaction.model.js");
const { executeMongoDbTransaction } = require("../../services/crud.service.js");
const settingService = require("../../services/setting.service.js");
const create = async (req, res) => {
  const body = await expenseDto.validateAsync(req.body);
  body.org = req.params.orgId;

  await executeMongoDbTransaction(async (session) => {
    const expense = new Expense(body);
    await expense.save({ session });
    
    const setting = await settingService.getDetailedSettingForOrg(req.params.orgId, session);
    if (!setting) throw new OrgNotFound();

    const transaction = new Transaction({
      org: req.params.orgId,
      createdBy: req.body.createdBy,
      docModel: "expense",
      financialYear: setting.financialYear,
      doc: expense._id,
      total: req.body.amount,
    });

    await transaction.save({ session });
    logger.info(`expense created ${expense.id}`);

    await OrgModel.updateOne(
      { _id: req.params.orgId },
      { $inc: { "relatedDocsCount.expenses": 1 } },
      { session }
    );
    return res.status(201).json(expense);
  });
};

module.exports = create;
