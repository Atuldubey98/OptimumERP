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
} = require("../controllers/proforma_invoice.controller");
const { updateModel } = require("../middlewares/crud.middleware");

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
proformaInvoiceRouter.delete(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  deleteProformaInvoice
);
module.exports = proformaInvoiceRouter;
