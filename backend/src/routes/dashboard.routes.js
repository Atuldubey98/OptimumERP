const { Router } = require("express");

const { read } = require("../controllers/dashboard.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get("/", requestAsyncHandler(read));

module.exports = dashboardRouter;
