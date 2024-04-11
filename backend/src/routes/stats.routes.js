const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { getStats } = require("../controllers/stats.controller");
const statsRouter = Router({mergeParams : true});

statsRouter.get("/", authenticate, checkOrgAuthorization, getStats);
module.exports = statsRouter;
