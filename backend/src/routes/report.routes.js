const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { getReportByType } = require("../controllers/report.controller");

const reportRouter = Router({
  mergeParams: true,
});

reportRouter.get("/:reportType", authenticate, checkOrgAuthorization, getReportByType);
module.exports = reportRouter;
