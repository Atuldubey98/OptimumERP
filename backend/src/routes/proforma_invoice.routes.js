const { Router } = require("express");
const {
  authenticate,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
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
proformaInvoiceRouter.get("/", getProformaInvoices);
proformaInvoiceRouter.get("/nextProformaInvoiceNo", getNextProformaInvoiceNo);
proformaInvoiceRouter.patch("/:id", updateModel, updateProformaInvoice);
proformaInvoiceRouter.get("/:id", getProformaInvoiceById);

proformaInvoiceRouter.post(
  "/:id/convertToInvoice",
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  convertProformaToInvoice
);
proformaInvoiceRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("proformaInvoices"),
  createProformaInvoice
);
proformaInvoiceRouter.delete("/:id", deleteProformaInvoice);

proformaInvoiceRouter.get("/:id/view", viewProformaInvoicce);

proformaInvoiceRouter.get("/:id/download", downloadProformaInvoice);
module.exports = proformaInvoiceRouter;
