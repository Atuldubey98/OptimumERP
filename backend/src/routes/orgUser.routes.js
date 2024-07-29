const { Router } = require("express");
const partyRouter = require("./parties.routes");
const productRouter = require("./product.routes");
const quoteRouter = require("./quote.routes");
const invoiceRouter = require("./invoice.routes");
const dashboardRouter = require("./dashboard.routes");
const expenseRouter = require("./expense.routes");
const settingRouter = require("./settings.routes");
const purchaseRouter = require("./purchase.routes");
const reportRouter = require("./report.routes");
const productCategoryRouter = require("./productCategory.routes");
const purchaseOrderRouter = require("./purchaseOrder.routes");
const contactRouter = require("./contact.routes");
const statsRouter = require("./stats.routes");
const proformaInvoiceRouter = require("./proformaInvoice.routes");
const {
  closeFinanialYear,
  createOrgUser,
  getUsersOfOrganization,
  read,
  update,
  updateOrgUser,
} = require("../controllers/org.controller");
const { authorize } = require("../middlewares/auth.middleware");
const expenseCategoryRouter = require("./expenseCategory.routes");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const taxRouter = require("./tax.routes");
const umRouter = require("./um.routes");

const orgUserRouter = Router({
  mergeParams: true,
});

orgUserRouter.get("/", requestAsyncHandler(read));
orgUserRouter.patch("/", requestAsyncHandler(update));
orgUserRouter.get(
  "/users",
  authorize,
  requestAsyncHandler(getUsersOfOrganization)
);
orgUserRouter.post("/users", authorize, requestAsyncHandler(createOrgUser));
orgUserRouter.post(
  "/closeFinancialYear",
  authorize,
  requestAsyncHandler(closeFinanialYear)
);
orgUserRouter.patch(
  "/users/:userId",
  authorize,
  requestAsyncHandler(updateOrgUser)
);

orgUserRouter.use("/parties", partyRouter);
orgUserRouter.use("/products", productRouter);
orgUserRouter.use("/quotes", quoteRouter);
orgUserRouter.use("/invoices", invoiceRouter);
orgUserRouter.use("/dashboard", dashboardRouter);
orgUserRouter.use("/expenses", expenseRouter);
orgUserRouter.use("/settings", settingRouter);
orgUserRouter.use("/purchases", purchaseRouter);
orgUserRouter.use("/reports", reportRouter);
orgUserRouter.use("/taxes", taxRouter);
orgUserRouter.use("/ums", umRouter);
orgUserRouter.use("/productCategories", productCategoryRouter);
orgUserRouter.use("/expenseCategories", expenseCategoryRouter);
orgUserRouter.use("/purchaseOrders", purchaseOrderRouter);
orgUserRouter.use("/contacts", contactRouter);
orgUserRouter.use("/proformaInvoices", proformaInvoiceRouter);
orgUserRouter.use("/stats", statsRouter);

module.exports = orgUserRouter;
