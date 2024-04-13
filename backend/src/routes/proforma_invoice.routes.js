const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  getProformaInvoices,
  updateProformaInvoice,
  deleteProformaInvoice,
  getNextProformaInvoiceNo,
  createProformaInvoice,
  getProformaInvoiceById,
  viewProformaInvoicce,
  downloadProformaInvoice,
  convertProformaToInvoice,
} = require("../controllers/proforma_invoice.controller");
const { updateModel, createModel } = require("../middlewares/crud.middleware");

const proformaInvoiceRouter = Router({
  mergeParams: true,
});
proformaInvoiceRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  getProformaInvoices
);
proformaInvoiceRouter.get(
  "/nextProformaInvoiceNo",
  authenticate,
  checkOrgAuthorization,
  getNextProformaInvoiceNo
);
proformaInvoiceRouter.patch(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  updateModel,
  updateProformaInvoice
);
proformaInvoiceRouter.get(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  getProformaInvoiceById
);

proformaInvoiceRouter.post(
  "/:id/convertToInvoice",
  authenticate,
  checkOrgAuthorization,
  convertProformaToInvoice
);
proformaInvoiceRouter.post(
  "/",
  authenticate,
  checkOrgAuthorization,
  createModel,
  createProformaInvoice
);
proformaInvoiceRouter.delete(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  deleteProformaInvoice
);

proformaInvoiceRouter.get(
  "/:id/view",
  authenticate,
  checkOrgAuthorization,
  viewProformaInvoicce
);

proformaInvoiceRouter.get(
  "/:id/download",
  authenticate,
  checkOrgAuthorization,
  downloadProformaInvoice
);
module.exports = proformaInvoiceRouter;
