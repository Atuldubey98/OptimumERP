import Purchase from "../models/purchase.model";

const Invoice = require("../models/invoice.model");
function generateReportByReportType(reportType) {
  const reportMap = {
    sale: getSaleReport,
    purchase: getPurchaseReport,
    day_book: getDayBookReport,
    transactions: getTransactions,
    parties: getAllPartyStatements,
    sale_purchase: getSalePurchaseByParty,
    gstr1: getGSTR1Report,
    gstr2: getGSTR2Report,
  };
  return reportMap[reportType];
}
async function getSaleReport(queryParams) {
  const filter = {
    org: queryParams.orgId,
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
function getDayBookReport(queryParams) {}
function getTransactions(queryParams) {}
function getAllPartyStatements(queryParams) {}
function getSalePurchaseByParty(queryParams) {}
function getGSTR1Report(queryParams) {}
function getGSTR2Report(queryParams) {}
async function getPurchaseReport(queryParams) {
  const filter = {
    org: queryParams.orgId,
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
export default getReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const reportFn = generateReportByReportType(reportType);
  const response = await reportFn(req.query);
  return res.status(200).json(response);
});
