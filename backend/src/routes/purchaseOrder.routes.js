const { Router } = require("express");
const {
  limitEntityCreation,
  checkPlan,
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
  send,
  read,
  exportData,
  remove,
  update,
  activities,
} = require("../controllers/purchaseOrder.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const purchaseOrderRouter = Router({ mergeParams: true });

purchaseOrderRouter.post(
  "/",
  createModel,
  limitEntityCreation("purchaseOrders"),
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
purchaseOrderRouter.post(
  "/:id/send",
  checkPlan(["gold", "platinum"]),
  requestAsyncHandler(send)
);
purchaseOrderRouter.get("/:id/activities", requestAsyncHandler(activities));

module.exports = purchaseOrderRouter;
