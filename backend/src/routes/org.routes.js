const { Router } = require("express");
const { createOrg, getOrgsOfUser } = require("../controllers/org.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const orgUserRouter = require("./org_user.routes");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const saleOrderRouter = require("./sale_order.routes");
const recurringInvoiceRouter = require("./recurring_invoices.routes");

const organizationRouter = Router();
organizationRouter.post("/", authenticate, createModel, createOrg);
organizationRouter.get("/", authenticate, getOrgsOfUser);

organizationRouter.use(
  "/:orgId",
  authenticate,
  checkOrgAuthorization,
  orgUserRouter
);

module.exports = organizationRouter;
