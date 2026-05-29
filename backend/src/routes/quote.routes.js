const { Router } = require("express");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  limitEntityCreation,
  checkPlan,
} = require("../middlewares/auth.middleware");
const {
  convertQuoteToInvoice,
  create,
  download,
  send,
  htmlView,
  paginate,
  read,
  nextSequence,
  exportData,
  remove,
  update,
  activities,
} = require("../controllers/quotes.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const quoteRouter = Router({
  mergeParams: true,
});

quoteRouter.post(
  "/",
  createModel,
  limitEntityCreation("quotes"),
  requestAsyncHandler(create)
);

quoteRouter.get("/nextQuoteNo", requestAsyncHandler(nextSequence));
quoteRouter.get("/export", requestAsyncHandler(exportData));
quoteRouter.get("/:id", requestAsyncHandler(read));

quoteRouter.post(
  "/:id/convertToInvoice",
  limitEntityCreation("invoices"),
  requestAsyncHandler(convertQuoteToInvoice)
);
quoteRouter.delete("/:id", requestAsyncHandler(remove));
quoteRouter.get("/", paginateModel, requestAsyncHandler(paginate));

quoteRouter.patch("/:id", updateModel, requestAsyncHandler(update));
quoteRouter.get("/:id/view", requestAsyncHandler(htmlView));
quoteRouter.get("/:id/download", requestAsyncHandler(download));
quoteRouter.post(
  "/:id/send",
  checkPlan(["gold", "platinum"]),
  requestAsyncHandler(send)
);
quoteRouter.get("/:id/activities", requestAsyncHandler(activities));


module.exports = quoteRouter;
