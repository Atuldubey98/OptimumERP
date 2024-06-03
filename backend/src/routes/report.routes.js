const { Router } = require("express");
const {
  getReportByType,
  downloadReportByType,
} = require("../controllers/report.controller");

const reportRouter = Router({
  mergeParams: true,
});

reportRouter.get("/:reportType", getReportByType);
reportRouter.get("/:reportType/download", downloadReportByType);
module.exports = reportRouter;
