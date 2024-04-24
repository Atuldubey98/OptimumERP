const {
  ExpenseCategoryNotDeleted,
} = require("../errors/expense_category.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Expense = require("../models/expense.model");
const ExpenseCategory = require("../models/expense_category");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const Setting = require("../models/settings.model");
const { OrgNotFound } = require("../errors/org.error");
const { ExpenseNotFound } = require("../errors/expense.error");
const logger = require("../logger");
const { expenseCategoryDto } = require("../dto/expense_category.dto");
const OrgModel = require("../models/org.model");
const { Types } = mongoose;

exports.getExpense = requestAsyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    org: req.params.orgId,
    _id: req.params.expenseId,
  });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  return res.status(200).json({ data: expense });
});
exports.getExpenseCategory = requestAsyncHandler(async (req, res) => {
  const expenseCategory = await ExpenseCategory.findOne({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  if (!expenseCategory)
    return res.status(404).json({ message: "Expense not found" });
  return res.status(200).json({ data: expenseCategory });
});
exports.createExpenseCategory = requestAsyncHandler(async (req, res) => {
  const body = await expenseCategoryDto.validateAsync(req.body);
  const category = await ExpenseCategory.create({
    ...body,
    org: req.params.orgId,
  });
  logger.info(`created expense category ${category.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenseCategories": 1 } }
  );
  return res.status(201).json(category);
});
exports.updateExpenseCategory = requestAsyncHandler(async (req, res) => {
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
  if (!category) throw new Error("Expense category not found");
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
  const expense = await Expense.create({ org: req.params.orgId, ...req.body });
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
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: "category",
  };
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  const category = req.query.category || "";

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  const totalCount = await Expense.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);

  const expenses = await Expense.find(filter)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .populate("category")

    .exec();

  res.status(200).json({
    data: expenses,
    currentPage: options.page,
    totalCount,
    totalPages,
  });
});

exports.updateExpense = requestAsyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  if (!mongoose.isValidObjectId(expenseId)) {
    return res.status(404).json({ message: "Invalid expense ID" });
  }
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
  if (!Types.ObjectId.isValid(expenseId)) {
    return res.status(404).json({ message: "Invalid expense ID" });
  }
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
