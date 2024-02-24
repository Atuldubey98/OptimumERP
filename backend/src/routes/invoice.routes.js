const { Router } = require("express");
const authenticate = require("../middlewares/authentication.middleware");
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
module.exports = invoiceRouter;
