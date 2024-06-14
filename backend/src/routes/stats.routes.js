const { Router } = require("express");
const { getStats } = require("../controllers/stats.controller");
const statsRouter = Router({ mergeParams: true });

statsRouter.get("/", getStats);
module.exports = statsRouter;
