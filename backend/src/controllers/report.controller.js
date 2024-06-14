const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { getInvoices } = require("../controllers/invoice.controller");
const { getPurchases } = require("../controllers/purchase.controller");
const { getTransactions } = require("./transactions.controller");
const {
  makeReportExcelBuffer,
  getReportForBill,
} = require("../helpers/report.helper");

exports.getReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const reportMap = {
    sale: getInvoices,
    purchase: getPurchases,
    transactions: getTransactions,
    gstr1: getInvoices,
    gstr2: getPurchases,
  };
  const reportHandler = reportMap[reportType];
  if (!reportHandler) throw new Error("Report type not found");
  reportHandler(req, res);
});

exports.downloadReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const reportData = await getReportForBill({
    req,
    reportType,
  });
  const excelBuffer = await makeReportExcelBuffer({
    reportData,
    reportType,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${reportType}.xlsx `
  );
  res.setHeader("Content-Length", excelBuffer.length);
  return res.send(excelBuffer);
});
