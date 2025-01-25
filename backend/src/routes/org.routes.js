const { Router } = require("express");
const {
  getUserOrgs,
  create,
  uploadLogo,
  removeLogo,
} = require("../controllers/org.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const orgUserRouter = require("./orgUser.routes");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { logoUploader } = require("../middlewares/uploader.middleware");

const organizationRouter = Router();
organizationRouter.post(
  "/",
  authenticate,
  createModel,
  requestAsyncHandler(create)
);
organizationRouter.get("/", authenticate, requestAsyncHandler(getUserOrgs));
organizationRouter.post(
  "/:orgId/logo",
  authenticate,
  logoUploader.single("logo"),
  requestAsyncHandler(uploadLogo)
);
organizationRouter.delete(
  "/:orgId/logo",
  authenticate,
  requestAsyncHandler(removeLogo)
);

organizationRouter.use(
  "/:orgId",
  authenticate,
  checkOrgAuthorization,
  orgUserRouter
);

module.exports = organizationRouter;
