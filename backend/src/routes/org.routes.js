const { Router } = require("express");
const {
  createNewUserForOrg,
  getOrg,
  createOrg,
  getOrgsOfUser,
  getAllUsersOfOrganization,
  updateOrganizationUser,
  updateOrganization,
} = require("../controllers/org.controller");
const {
  authenticate,
  authorize,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const partyRouter = require("./parties.routes");
const productRouter = require("./product.routes");
const quoteRouter = require("./quote.routes");
const invoiceRouter = require("./invoice.routes");
const dashboardRouter = require("./dashboard.routes");
const expenseRouter = require("./expense.routes");
const settingRouter = require("./settings.router");
const purchaseRouter = require("./purchase.routes");
const reportRouter = require("./report.routes");
const productCategoryRouter = require("./product_category.routes");
const purchaseOrderRouter = require("./purchase_order.routes");
const contactRouter = require("./contact.routes");
const statsRouter = require("./stats.routes");
const proformaInvoiceRouter = require("./proforma_invoice.routes");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");

const organizationRouter = Router();
organizationRouter.post("/", authenticate, createModel, createOrg);
organizationRouter.get("/", authenticate, getOrgsOfUser);
organizationRouter.get("/:orgId", authenticate, checkOrgAuthorization, getOrg);
organizationRouter.patch(
  "/:orgId",
  authenticate,
  checkOrgAuthorization,
  updateOrganization
);
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
organizationRouter.use("/:orgId/parties", partyRouter);
organizationRouter.use("/:orgId/products", productRouter);
organizationRouter.use("/:orgId/quotes", quoteRouter);
organizationRouter.use("/:orgId/invoices", invoiceRouter);
organizationRouter.use("/:orgId/dashboard", dashboardRouter);
organizationRouter.use("/:orgId/expenses", expenseRouter);
organizationRouter.use("/:orgId/settings", settingRouter);
organizationRouter.use("/:orgId/purchases", purchaseRouter);
organizationRouter.use("/:orgId/reports", reportRouter);
organizationRouter.use("/:orgId/productCategories", productCategoryRouter);
organizationRouter.use("/:orgId/purchaseOrders", purchaseOrderRouter);
organizationRouter.use("/:orgId/contacts", contactRouter);
organizationRouter.use("/:orgId/proformaInvoices", proformaInvoiceRouter);
organizationRouter.use("/:orgId/stats", statsRouter);

module.exports = organizationRouter;
