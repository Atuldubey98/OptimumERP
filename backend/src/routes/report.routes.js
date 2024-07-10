const { Router } = require("express");

const requestAsyncHandler = require("../handlers/requestAsync.handler");
const {
  downloadReportByType,
  getReportByType,
} = require("../controllers/report.controller");
const reportRouter = Router({
  mergeParams: true,
});

reportRouter.get("/:reportType", requestAsyncHandler(getReportByType));
reportRouter.get(
  "/:reportType/download",
  requestAsyncHandler(downloadReportByType)
);
module.exports = reportRouter;
