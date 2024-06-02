const {
  ExpenseCategoryNotDeleted,
  ExpenseCategoryNotFound,
} = require("../errors/expense_category.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Expense = require("../models/expense.model");
const ExpenseCategory = require("../models/expense_category");
const Transaction = require("../models/transaction.model");
const Setting = require("../models/settings.model");
const { OrgNotFound } = require("../errors/org.error");
const { ExpenseNotFound } = require("../errors/expense.error");
const logger = require("../logger");
const { expenseCategoryDto } = require("../dto/expense_category.dto");
const OrgModel = require("../models/org.model");
const { expenseDto } = require("../dto/expense.dto");
const { getPaginationParams } = require("../helpers/crud.helper");
const config = require("../constants/config");

exports.getExpense = requestAsyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    org: req.params.orgId,
    _id: req.params.expenseId,
  });
  if (!expense) throw new ExpenseNotFound();
  return res.status(200).json({ data: expense });
});
exports.getExpenseCategory = requestAsyncHandler(async (req, res) => {
  const expenseCategory = await ExpenseCategory.findOne({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  if (!expenseCategory) throw new ExpenseCategoryNotFound();
  return res.status(200).json({ data: expenseCategory });
});
exports.createExpenseCategory = requestAsyncHandler(async (req, res) => {
  const body = await expenseCategoryDto.validateAsync(req.body);
  body.org = req.params.orgId;
  logger.info(`created expense category ${category.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenseCategories": 1 } }
  );
  return res.status(201).json(category);
});
exports.updateExpenseCategory = requestAsyncHandler(async (req, res) => {
  if (!req.params.categoryId) throw new ExpenseCategoryNotFound();
  const category = await ExpenseCategory.findOneAndUpdate(
    {
      org: req.params.orgId,
      _id: req.params.categoryId,
    },
    req.body,
    {
      new: true,
    }
  );
  logger.info(`updated expense category ${category.id}`);
  if (!category) throw new ExpenseCategoryNotFound();
  return res.status(200).json({ data: category });
});
exports.deleteExpenseCategory = requestAsyncHandler(async (req, res) => {
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
  });
  if (!category) throw new ExpenseCategoryNotFound();
  logger.info(`deleted expense category ${category.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenseCategories": -1 } }
  );
  return res.status(200).json({ data: category });
});

exports.getAllExpenseCategories = requestAsyncHandler(async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };
  const categories = await ExpenseCategory.find(filter);
  return res.status(200).json({ data: categories });
});

exports.createExpense = requestAsyncHandler(async (req, res) => {
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
});

exports.getAllExpenses = requestAsyncHandler(async (req, res) => {
  const { skip, limit, filter, page, total, totalPages } =
    await getPaginationParams({
      req,
      modelName: config.EXPENSES,
      model: Expense,
    });
  const expenses = await Expense.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("category")
    .exec();
  return res.status(200).json({
    data: expenses,
    currentPage: page,
    totalCount: total,
    totalPages,
  });
});

exports.updateExpense = requestAsyncHandler(async (req, res) => {
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
});

exports.deleteExpense = requestAsyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) throw new ExpenseNotFound();
  const deletedExpense = await Expense.findOneAndDelete({
    _id: expenseId,
    org: req.params.orgId,
  });

  if (!deletedExpense) throw new ExpenseNotFound();
  const transaction = await Transaction.findOneAndDelete({
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
});
