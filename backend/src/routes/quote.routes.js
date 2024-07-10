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
  convertQuoteToInvoice,
  create,
  download,
  htmlView,
  paginate,
  read,
  nextSequence,
  remove,
  update,
} = require("../controllers/quotes.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const quoteRouter = Router({
  mergeParams: true,
});

quoteRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("quotes"),
  requestAsyncHandler(create)
);

quoteRouter.get("/nextQuoteNo", requestAsyncHandler(nextSequence));
quoteRouter.get("/:id", requestAsyncHandler(read));

quoteRouter.post(
  "/:id/convertToInvoice",
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  requestAsyncHandler(convertQuoteToInvoice)
);
quoteRouter.delete("/:id", requestAsyncHandler(remove));
quoteRouter.get("/", paginateModel, requestAsyncHandler(paginate));

quoteRouter.patch("/:id", updateModel, requestAsyncHandler(update));
quoteRouter.get("/:id/view", requestAsyncHandler(htmlView));
quoteRouter.get("/:id/download", requestAsyncHandler(download));

module.exports = quoteRouter;
