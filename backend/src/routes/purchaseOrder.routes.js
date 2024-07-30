const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  createModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  create,
  download,
  htmlView,
  nextSequence,
  paginate,
  read,
  exportData,
  remove,
  update,
} = require("../controllers/purchaseOrder.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const purchaseOrderRouter = Router({ mergeParams: true });

purchaseOrderRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("purchaseOrders"),
  requestAsyncHandler(create)
);

purchaseOrderRouter.get(
  "/nextPurchaseOrderNo",
  requestAsyncHandler(nextSequence)
);
purchaseOrderRouter.get("/export", requestAsyncHandler(exportData));
purchaseOrderRouter.delete("/:id", requestAsyncHandler(remove));
purchaseOrderRouter.get("/:id", requestAsyncHandler(read));
purchaseOrderRouter.patch("/:id", requestAsyncHandler(update));
purchaseOrderRouter.get("/", paginateModel, requestAsyncHandler(paginate));
purchaseOrderRouter.get("/:id/view", requestAsyncHandler(htmlView));
purchaseOrderRouter.get("/:id/download", requestAsyncHandler(download));
module.exports = purchaseOrderRouter;
