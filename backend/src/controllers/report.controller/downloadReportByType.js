const {
  getReportForBill,
  makeReportExcelBuffer,
} = require("../../helpers/report.helper");

const downloadReportByType = async (req, res) => {
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
};
module.exports = downloadReportByType;
