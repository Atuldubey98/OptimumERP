const { Router } = require("express");
const {
  createNewUserForOrg,
  getOrg,
  createOrg,
  getOrgsOfUser,
  getAllUsersOfOrganization,
  updateOrganizationUser,
} = require("../controllers/org.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const customerRouter = require("./customers.routes");
const productRouter = require("./product.routes");
const quoteRouter = require("./quote.routes");
const invoiceRouter = require("./invoice.routes");
const dashboardRouter = require("./dashboard.routes");
const expenseRouter = require("./expense.routes");
const settingRouter = require("./settings.router");
const purchaseRouter = require("./purchase.routes");
const reportRouter = require("./report.routes");

const organizationRouter = Router();
organizationRouter.post("/", authenticate, createModel, createOrg);
organizationRouter.get("/", authenticate, getOrgsOfUser);
organizationRouter.get("/:orgId", authenticate, getOrg);
organizationRouter.get(
  "/:orgId/users",
  authenticate,
  authorize,
  getAllUsersOfOrganization
);
organizationRouter.post(
  "/:orgId/users",
  authenticate,
  authorize,
  createNewUserForOrg
);
organizationRouter.patch(
  "/:orgId/users/:userId",
  authenticate,
  authorize,
  updateOrganizationUser
);
organizationRouter.use("/:orgId/customers", customerRouter);
organizationRouter.use("/:orgId/products", productRouter);
organizationRouter.use("/:orgId/quotes", quoteRouter);
organizationRouter.use("/:orgId/invoices", invoiceRouter);
organizationRouter.use("/:orgId/dashboard", dashboardRouter);
organizationRouter.use("/:orgId/expenses", expenseRouter);
organizationRouter.use("/:orgId/settings", settingRouter);
organizationRouter.use("/:orgId/purchases", purchaseRouter);
organizationRouter.use("/:orgId/reports", reportRouter);

module.exports = organizationRouter;
