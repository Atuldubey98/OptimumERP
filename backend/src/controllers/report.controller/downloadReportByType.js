const reportService = require("../../services/report.service");
const { getDisplaySettingForOrg } = require("../../services/setting.service");
const Org = require("../../models/org.model");
const { moneyUtils } = require("../../utils");

const downloadReportByType = async (req, res) => {
  const reportType = req.params.reportType;
  const orgId = req.params.orgId;
  const { startDate, endDate } = req.query;

  const [org, setting] = await Promise.all([
    Org.findById(orgId),
    getDisplaySettingForOrg(orgId),
  ]);
  const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting.currency);
  const decimalDigits = currencyConfig?.decimal_digits || 2;

  const excelBuffer = await reportService.exportReportToExcel({
    req,
    reportType,
    orgId,
    organization: org,
    decimalDigits,
    startDate,
    endDate,
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
