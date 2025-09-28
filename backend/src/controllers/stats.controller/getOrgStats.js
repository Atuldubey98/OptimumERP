const Expense = require("../../models/expense.model");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const { Types, isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");

const getPeriodFilters = (period)=>{
  const periodFilters = {
    thisWeek: {
      $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      $lte: new Date(),
    },
    thisMonth: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
    thisYear: {
      $gte: new Date(new Date().getFullYear() - 1, 0, 1),
      $lte: new Date(new Date().getFullYear(), 11, 31),
    },
  }
  return periodFilters[period] || periodFilters['thisYear'];
}

const getOrgStats = async (req, res) => {
  const { period } = req.query;
  const orgId = req.params.orgId;
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const periodFilter = getPeriodFilters(period);
  const aggregator = [
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: periodFilter,
      },
    },
    {
      $group: {
        _id: null,
        totalTax: { $sum: "$totalTax" },
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
  ]
  const [invoicesTotal, purchaseTotal] = await Promise.all([
    Invoice.aggregate(aggregator),
    Purchase.aggregate(aggregator),
  ]);
  const topFiveAggregator = [
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: periodFilter,
      },
    },
    {
      $group: {
        _id: "$party",
        totalTax: { $sum: "$totalTax" },
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        totalTax: -1,
        total: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "parties",
        localField: "_id",
        foreignField: "_id",
        as: "party",
      },
    },
    {
      $unwind: "$party",
    },
  ];
  const topFiveClientTotal = await Invoice.aggregate(topFiveAggregator);
  const expensesByCategory = await Expense.aggregate([
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: periodFilter,
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "expense_categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  const response = {
    invoicesTotal: invoicesTotal.length ? invoicesTotal[0] : null,
    purchaseTotal: purchaseTotal.length ? purchaseTotal[0] : null,
    topFiveClientTotal,
    expensesByCategory,
  };
  return res.status(200).json({ data: response });
};

module.exports = getOrgStats;
