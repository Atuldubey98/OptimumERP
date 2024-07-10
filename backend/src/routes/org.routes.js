const { Router } = require("express");
const { getUserOrgs, create, } = require("../controllers/org.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const orgUserRouter = require("./orgUser.routes");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const organizationRouter = Router();
organizationRouter.post("/", authenticate, createModel, requestAsyncHandler(create));
organizationRouter.get("/", authenticate, requestAsyncHandler(getUserOrgs));

organizationRouter.use(
  "/:orgId",
  authenticate,
  checkOrgAuthorization,
  orgUserRouter
);

module.exports = organizationRouter;
