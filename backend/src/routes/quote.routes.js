const { Router } = require("express");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  createQuote,
  updateQuote,
  getQuote,
  getQuotes,
  getNextQuotationNumber,
  viewQuote,
  deleteQuote,
  downloadQuote,
  convertQuoteToInvoice,
} = require("../controllers/quotes.controller");
const quoteRouter = Router({
  mergeParams: true,
});

quoteRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("quotes"),
  createQuote
);

quoteRouter.get("/nextQuoteNo", getNextQuotationNumber);
quoteRouter.get("/:quoteId", getQuote);

quoteRouter.post(
  "/:quoteId/convertToInvoice",
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  convertQuoteToInvoice
);
quoteRouter.delete("/:quoteId", deleteQuote);
quoteRouter.get("/", paginateModel, getQuotes);

quoteRouter.patch(
  "/:quoteId",
  updateModel,

  updateQuote
);
quoteRouter.get("/:quoteId/view", viewQuote);
quoteRouter.get("/:quoteId/download", downloadQuote);

module.exports = quoteRouter;
