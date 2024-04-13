const { Router } = require("express");
const { authenticate, checkPlan } = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createInvoice,
  getNextInvoiceNumber,
  getInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice,
  downloadInvoice,
  viewInvoice,
  recordPayment,
  sendInvoice,
} = require("../controllers/invoice.controller");

const invoiceRouter = Router({
  mergeParams: true,
});

invoiceRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createInvoice
);

invoiceRouter.get(
  "/next-invoice-no",
  authenticate,
  checkOrgAuthorization,
  getNextInvoiceNumber
);
invoiceRouter.get(
  "/:invoiceId",
  authenticate,
  checkOrgAuthorization,
  getInvoice
);
invoiceRouter.delete(
  "/:invoiceId",
  authenticate,
  checkOrgAuthorization,
  deleteInvoice
);
invoiceRouter.get("/", authenticate, checkOrgAuthorization, getInvoices);

invoiceRouter.patch(
  "/:invoiceId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updateInvoice
);
invoiceRouter.get(
  "/:invoiceId/view",
  authenticate,
  checkOrgAuthorization,
  viewInvoice
);
invoiceRouter.get(
  "/:invoiceId/download",
  authenticate,
  checkOrgAuthorization,
  downloadInvoice
);
invoiceRouter.post(
  "/:invoiceId/payment",
  authenticate,
  checkOrgAuthorization,
  recordPayment
);
invoiceRouter.post(
  "/:invoiceId/send",
  authenticate,
  checkPlan(["gold", "platinum"]),
  checkOrgAuthorization,
  sendInvoice
);
module.exports = invoiceRouter;
