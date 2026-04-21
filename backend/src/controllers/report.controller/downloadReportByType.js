const {
  getReportForBill,
  makeReportExcelBuffer,
} = require("../../services/report.service");

const downloadReportByType = async (req, res) => {
  const reportType = req.params.reportType;
  const reportData = await getReportForBill({
    req,
    reportType,
  });
  
  const { getDisplaySettingForOrg } = require("../../services/setting.service");
  const { moneyUtils } = require("../../utils");
  let decimalDigits = 2;
  if (reportData.length > 0) {
    const orgId = reportData[0].org;
    const setting = await getDisplaySettingForOrg(orgId);
    const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting.currency);
    decimalDigits = currencyConfig?.decimal_digits || 2;
  }

  const excelBuffer = await makeReportExcelBuffer({
    reportData,
    reportType,
    decimalDigits,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${reportType}.xlsx`
  );
  res.setHeader("Content-Length", excelBuffer.length);
  return res.send(excelBuffer);
};
module.exports = downloadReportByType;
