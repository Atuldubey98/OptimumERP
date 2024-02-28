const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Expense = require("../models/expense.model");
const ExpenseCategory = require("../models/expense_category");
const mongoose = require("mongoose");
const { Types } = mongoose;

exports.getExpense = requestAsyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    org: req.params.orgId,
    _id: req.params.expenseId,
  });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  return res.status(200).json({ data: expense });
});
exports.createExpenseCategory = requestAsyncHandler(async (req, res) => {
  const category = await ExpenseCategory.create({
    ...req.body,
    org: req.params.orgId,
  });
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
  return res.status(200).json({ data: category });
});
exports.deleteExpenseCategory = requestAsyncHandler(async (req, res) => {
  const category = await ExpenseCategory.findOneAndDelete({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  if (!category) throw new Error("Expense category not found");
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
  const expense = await Expense.create({ org: req.params.orgId });
  res.status(201).json(expense);
});

exports.getAllExpenses = requestAsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: "category",
  };

  const totalCount = await Expense.countDocuments({
    org: req.params.orgId,
  });
  const totalPages = Math.ceil(totalCount / limit);

  if (options.page > totalPages) {
    return res.status(400).json({ message: "Invalid page number" });
  }

  const expenses = await Expense.find({ org: req.params.orgId })
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
  if (!Types.ObjectId.isValid(expenseId)) {
    return res.status(404).json({ message: "Invalid expense ID" });
  }
  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: expenseId, org: req.params.orgId },
    req.body,
    {
      new: true,
    }
  );
  if (!updatedExpense) {
    return res.status(404).json({ message: "Expense not found" });
  }
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
  if (!deletedExpense) {
    return res.status(404).json({ message: "Expense not found" });
  }
  return res.status(200).json({ message: "Expense deleted successfully" });
});
