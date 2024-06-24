const { Router } = require("express");
const {
  checkPlan,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const {
  createInvoice,
  getNextInvoiceNumber,
  getInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice,
  recordPayment,
  sendInvoice,
  viewInvoice,
  downloadInvoice,
} = require("../controllers/invoice.controller");

const invoiceRouter = Router({
  mergeParams: true,
});

invoiceRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  createInvoice
);

invoiceRouter.get("/next-invoice-no", getNextInvoiceNumber);
invoiceRouter.get("/:invoiceId", getInvoice);
invoiceRouter.delete("/:invoiceId", deleteInvoice);
invoiceRouter.get("/", getInvoices);

invoiceRouter.patch("/:invoiceId", updateModel, updateInvoice);
invoiceRouter.get("/:invoiceId/view", viewInvoice);
invoiceRouter.get("/:invoiceId/download", downloadInvoice);
invoiceRouter.post("/:invoiceId/payment", recordPayment);
invoiceRouter.post(
  "/:invoiceId/send",
  checkPlan(["gold", "platinum"]),
  sendInvoice
);
module.exports = invoiceRouter;
