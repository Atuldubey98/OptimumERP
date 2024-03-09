const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { getReportByType, downloadReportByType } = require("../controllers/report.controller");

const reportRouter = Router({
  mergeParams: true,
});

reportRouter.get("/:reportType", authenticate, checkOrgAuthorization, getReportByType);
reportRouter.get("/:reportType/download", authenticate, checkOrgAuthorization, downloadReportByType);
module.exports = reportRouter;
