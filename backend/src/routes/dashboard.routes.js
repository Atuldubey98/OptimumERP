const { Router } = require("express");

const { getDashboard } = require("../controllers/dashboard.controller");

const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get("/", getDashboard);

module.exports = dashboardRouter;
