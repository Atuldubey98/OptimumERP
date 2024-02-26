const { Router } = require("express");
const authenticate = require("../middlewares/authentication.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");

const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get("/", authenticate, checkOrgAuthorization, getDashboard);

module.exports = dashboardRouter;
