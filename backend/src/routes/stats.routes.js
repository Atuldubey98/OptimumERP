const { Router } = require("express");
const { getOrgStats } = require("../controllers/stats.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const statsRouter = Router({ mergeParams: true });

statsRouter.get("/", requestAsyncHandler(getOrgStats));
module.exports = statsRouter;
