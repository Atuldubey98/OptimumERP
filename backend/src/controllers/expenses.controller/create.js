const { expenseDto } = require("../../dto/expense.dto");
const { OrgNotFound } = require("../../errors/org.error");
const logger = require("../../logger");
const Expense = require("../../models/expense.model");
const OrgModel = require("../../models/org.model");
const Setting = require("../../models/settings.model");
const Transaction = require("../../models/transaction.model");

const create = async (req, res) => {
  const body = await expenseDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const expense = await Expense.create(body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "expense",
    financialYear: setting.financialYear,
    doc: expense._id,
    total: req.body.amount,
  });
  await transaction.save();
  logger.info(`expense created ${expense.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenses": 1 } }
  );
  return res.status(201).json(expense);
};

module.exports = create;
