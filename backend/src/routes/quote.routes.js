const { Router } = require("express");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const authenticate = require("../middlewares/authentication.middleware");
const {
  createQuote,
  updateQuote,
  getQuote,
  getQuotes,
  getNextQuotationNumber,
  viewQuote,
  downloadQuote,
} = require("../controllers/quotes.controller");
const quoteRouter = Router({
  mergeParams: true,
});

quoteRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createQuote
);

quoteRouter.get(
  "/next-quote-no",
  authenticate,
  checkOrgAuthorization,
  getNextQuotationNumber
);
quoteRouter.get("/:quoteId", authenticate, checkOrgAuthorization, getQuote);
quoteRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  getQuotes
);

quoteRouter.patch(
  "/:quoteId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updateQuote
);
quoteRouter.get(
  "/:quoteId/download",
  authenticate,
  checkOrgAuthorization,
  viewQuote
);

module.exports = quoteRouter;
