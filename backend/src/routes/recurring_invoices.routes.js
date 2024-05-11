const { Router } = require("express");
const {
  authenticate,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createRecurringInvoice,
  cronGenerateInvoice,
} = require("../controllers/recurring_invoice.controller");

const recurringInvoiceRouter = Router({
  mergeParams: true,
});

recurringInvoiceRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  limitFreePlanOnCreateEntityForOrganization("recurringInvoices"),
  createRecurringInvoice
);

recurringInvoiceRouter.post("/generate", authenticate, cronGenerateInvoice);

module.exports = recurringInvoiceRouter;
