const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const Purchase = require("../models/purchase.model");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { default: mongoose } = require("mongoose");
function generateReportByReportType(reportType) {
  const reportMap = {
    sale: getSaleReport,
    purchase: getPurchaseReport,
    transactions: getTransactions,
    parties: getAllPartyStatements,
    gstr1: getGSTR1Report,
    gstr2: getGSTR2Report,
  };
  return reportMap[reportType];
}
async function getSaleReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }

  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    totalPages,
    total,
    data: invoices,
    page,
    skip,
    limit,
  };
}
async function getTransactions(queryParams, orgId) {
  const filter = {
    org: orgId,
  };

  if (queryParams.startDate && queryParams.endDate) {
    filter.createdAt = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  if (queryParams.type) filter.docModel = queryParams.type;
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Transaction.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: transactions,
    page,
    limit,
    totalPages,
    total,
    message: "Transactions retrieved successfully",
  };
}
async function getAllPartyStatements(queryParams, orgId) {
  const filter = {
    org: new mongoose.Types.ObjectId(orgId),
    docModel: { $in: ["invoice", "purchase"] },
  };
  if (queryParams.startDate && queryParams.endDate) {
    filter.createdAt = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const transactions = await Transaction.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: "$customer",
        total: {
          $sum: {
            $cond: [
              { $eq: ["$docModel", "purchase"] },
              { $subtract: ["$total", "$total"] },
              "$total",
            ],
          },
        },
        totalTax: {
          $sum: {
            $cond: [
              { $eq: ["$docModel", "purchase"] },
              { $subtract: ["$totalTax", "$totalTax"] },
              "$totalTax",
            ],
          },
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        as: "customer",
        foreignField: "_id",
      },
    },
    {
      $unwind: "$customer",
    },
  ]);
  return {
    data: transactions,
    skip,
    limit,
    page,
  };
}
async function getGSTR1Report(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: invoices,
    page,
    limit,
    totalPages,
    total,
    message: "GSTR1 retrieved successfully",
  };
}
async function getGSTR2Report(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Purchase.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: purchases,
    page,
    limit,
    totalPages,
    total,
    message: "GSTR2 retrieved successfully",
  };
}
async function getPurchaseReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }

  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Purchase.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: purchases,
    page,
    limit,
    totalPages,
    total,
    message: "Purchases retrieved successfully",
  };
}
exports.getReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const orgId = req.params.orgId;
  const reportFn = generateReportByReportType(reportType);
  if (!reportFn) throw new Error("Report type not found");
  const response = await reportFn(req.query, orgId);
  return res.status(200).json(response);
});
