const { isValidObjectId } = require("mongoose");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Invoice = require("../models/invoice.model");
const Purchase = require("../models/purchase.model");
const Setting = require("../models/settings.model");
const { Types } = require("mongoose");
const Expense = require("../models/expense.model");
exports.getStats = requestAsyncHandler(async (req, res) => {
  const currentDate = new Date();
  let startDate, endDate;

  const { period } = req.query;
  switch (period) {
    case "lastWeek":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      break;
    case "lastMonth":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      break;
    case "lastYear":
      startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
  }
  const orgId = req.params.orgId;
  const setting = await Setting.findOne({ org: req.params.orgId });
  if (!isValidObjectId(orgId)) throw new OrgNotFound();
  const invoicesTotal = await Invoice.aggregate([
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
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
  ]);
  const purchaseTotal = await Purchase.aggregate([
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
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
  ]);
  const topFiveClientTotal = await Invoice.aggregate([
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
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
  ]);
  const expensesByCategory = await Expense.aggregate([
    {
      $match: {
        org: new Types.ObjectId(req.params.orgId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
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
});
