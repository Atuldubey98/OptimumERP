const { Router } = require("express");
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
  createNewUserForOrg,
  getOrg,
  getAllUsersOfOrganization,
  updateOrganizationUser,
  updateOrganization,
} = require("../controllers/org.controller");
const { authorize } = require("../middlewares/auth.middleware");

const orgUserRouter = Router({
  mergeParams: true,
});

orgUserRouter.get("/", getOrg);
orgUserRouter.patch("/", updateOrganization);
orgUserRouter.get("/users", authorize, getAllUsersOfOrganization);
orgUserRouter.post("/users", authorize, createNewUserForOrg);
orgUserRouter.patch("/users/:userId", authorize, updateOrganizationUser);

orgUserRouter.use("/parties", partyRouter);
orgUserRouter.use("/products", productRouter);
orgUserRouter.use("/quotes", quoteRouter);
orgUserRouter.use("/invoices", invoiceRouter);
orgUserRouter.use("/dashboard", dashboardRouter);
orgUserRouter.use("/expenses", expenseRouter);
orgUserRouter.use("/settings", settingRouter);
orgUserRouter.use("/purchases", purchaseRouter);
orgUserRouter.use("/reports", reportRouter);
orgUserRouter.use("/productCategories", productCategoryRouter);
orgUserRouter.use("/purchaseOrders", purchaseOrderRouter);
orgUserRouter.use("/contacts", contactRouter);
orgUserRouter.use("/proformaInvoices", proformaInvoiceRouter);
orgUserRouter.use("/stats", statsRouter);

module.exports = orgUserRouter;
