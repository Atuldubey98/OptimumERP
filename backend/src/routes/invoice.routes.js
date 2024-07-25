const { Router } = require("express");
const {
  checkPlan,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const {
  create,
  update,
  htmlView,
  nextSequence,
  payment,
  exportData,
  remove,
  download,
  paginate,
  read,
} = require("../controllers/invoice.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const invoiceRouter = Router({
  mergeParams: true,
});

invoiceRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  requestAsyncHandler(create)
);

invoiceRouter.get("/nextSequence", requestAsyncHandler(nextSequence));
invoiceRouter.get("/export", requestAsyncHandler(exportData));
invoiceRouter.get("/:id", requestAsyncHandler(read));
invoiceRouter.delete("/:id", requestAsyncHandler(remove));
invoiceRouter.get("/", requestAsyncHandler(paginate));
invoiceRouter.patch("/:id", updateModel, requestAsyncHandler(update));
invoiceRouter.get("/:id/view", requestAsyncHandler(htmlView));
invoiceRouter.get("/:id/download", requestAsyncHandler(download));
invoiceRouter.post("/:id/payment", requestAsyncHandler(payment));

module.exports = invoiceRouter;
