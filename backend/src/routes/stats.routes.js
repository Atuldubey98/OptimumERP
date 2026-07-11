const { Router } = require("express");
const { getOrgStats, forecast } = require("../controllers/stats.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const statsRouter = Router({ mergeParams: true });

statsRouter.get("/", requestAsyncHandler(getOrgStats));
statsRouter.get("/forecast", requestAsyncHandler(forecast));
module.exports = statsRouter;
