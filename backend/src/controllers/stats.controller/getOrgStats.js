const Expense = require("../../models/expense.model");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const { Types, isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../../errors/org.error");

const getPeriodFilters = (period) => {
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(
    now.getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999
  );

  const filters = {
    thisWeek: { $gte: startOfWeek, $lte: endOfWeek },
    thisMonth: { $gte: startOfMonth, $lte: endOfMonth },
    thisYear: { $gte: startOfYear, $lte: endOfYear },
  };

  return filters[period] || filters.thisYear;
};

const getOrgStats = async (req, res) => {
  const { period } = req.query;
  const orgId = req.params.orgId;

  if (!isValidObjectId(orgId)) throw new OrgNotFound();

  const periodFilter = getPeriodFilters(period);
  const objectOrgId = new Types.ObjectId(orgId);

  const baseMatch = {
    org: objectOrgId,
    date: periodFilter,
  };

  const aggregator = [
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        totalTax: { $sum: "$totalTax" },
        total: { $sum: "$total" },
        shippingCharges: { $sum: "$shippingCharges" },
        grandTotal: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
  ];

  const topFiveAggregator = [
    { $match: baseMatch },
    {
      $group: {
        _id: "$party",
        totalTax: { $sum: "$totalTax" },
        total: { $sum: "$total" },
        shippingCharges: { $sum: "$shippingCharges" },
        grandTotal: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { grandTotal: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "parties",
        localField: "_id",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              gstNo: 1,
            },
          },
        ],
        as: "party",
      },
    },
    { $unwind: "$party" },
  ];

  const expensesPipeline = [
    { $match: baseMatch },
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
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const [
    invoicesTotal,
    purchaseTotal,
    topFiveClientTotal,
    expensesByCategory,
  ] = await Promise.all([
    Invoice.aggregate(aggregator),
    Purchase.aggregate(aggregator),
    Invoice.aggregate(topFiveAggregator),
    Expense.aggregate(expensesPipeline),
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