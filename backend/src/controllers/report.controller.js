const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const Purchase = require("../models/purchase.model");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { getInvoices } = require("../controllers/invoice.controller");
const { getPurchases } = require("../controllers/purchase.controller");
const { getTransactions } = require("./transactions.controller");
const { getPaginationParams } = require("../helpers/crud.helper");
const {
  INVOICES,
  PURCHASE_INVOICES,
  TRANSACTIONS,
} = require("../constants/entities");
const { sendExcelBufferResponse } = require("../helpers/render_engine.helper");
const { makeReportExcelBuffer } = require("../helpers/report.helper");
function generateReportByReportType(reportType) {
  const reportMap = {
    sale: getInvoices,
    purchase: getPurchases,
    transactions: getTransactions,
    gstr1: getInvoices,
    gstr2: getPurchases,
  };
  return reportMap[reportType];
}

exports.getReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const reportHandler = generateReportByReportType(reportType);
  if (!reportHandler) throw new Error("Report type not found");
  reportHandler(req, res);
});

function getDownloadReportFn(reportType) {
  const reportTypes = {
    sale: downloadSaleReport,
    purchase: downloadPurchaseReport,
    gstr1: downloadSaleReport,
    gstr2: downloadPurchaseReport,
    transactions: downloadTransactionsReport,
  };
  return reportTypes[reportType];
}

async function downloadSaleReport(req) {
  const { filter } = await getPaginationParams({
    req,
    model: Invoice,
    modelName: INVOICES,
    shouldPaginate: false,
  });
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party");
  return invoices;
}
async function downloadPurchaseReport(req) {
  const { filter } = await getPaginationParams({
    req,
    model: Purchase,
    modelName: PURCHASE_INVOICES,
    shouldPaginate: false,
  });
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("party");
  return purchases;
}

async function downloadTransactionsReport(req) {
  const { filter } = await getPaginationParams({
    req,
    model: Transaction,
    modelName: TRANSACTIONS,
    shouldPaginate: false,
  });
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .populate("party");
  return transactions;
}

exports.downloadReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const reportFn = getDownloadReportFn(reportType);
  if (!reportFn) throw new Error("Report type not found");
  const reportData = await reportFn(req);
  const excelBuffer = await makeReportExcelBuffer({
    reportData,
    reportType,
  });
  sendExcelBufferResponse({
    excelBuffer,
    fileName: `${reportType}-${new Date().toUTCString()}.xlsx`,
    res,
  });
});
