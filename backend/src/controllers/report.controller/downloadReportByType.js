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
  let decimalDigits = 2;
  let organization = null;
  if (reportData.length > 0) {
    const orgId = reportData[0].org;
    const { getDisplaySettingForOrg } = require("../../services/setting.service");
    const Org = require("../../models/org.model");
    const organizationPromise = Org.findById(orgId);
    const settingPromise = getDisplaySettingForOrg(orgId);
    
    const [org, setting] = await Promise.all([organizationPromise, settingPromise]);
    organization = org;
    
    const { moneyUtils } = require("../../utils");
    const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting.currency);
    decimalDigits = currencyConfig?.decimal_digits || 2;
  }

  const excelBuffer = await makeReportExcelBuffer({
    reportData,
    reportType,
    decimalDigits,
    organization,
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
