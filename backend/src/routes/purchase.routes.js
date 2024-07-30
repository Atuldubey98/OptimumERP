const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");

const {
  create,
  download,
  htmlView,
  paginate,
  read,
  remove,
  exportData,
  payment,
  update,
} = require("../controllers/purchase.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const purchaseRouter = Router({
  mergeParams: true,
});

purchaseRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("purchases"),
  requestAsyncHandler(create)
);
purchaseRouter.get("/export", requestAsyncHandler(exportData));
purchaseRouter.get("/:id", requestAsyncHandler(read));
purchaseRouter.delete("/:id", requestAsyncHandler(remove));
purchaseRouter.get("/", requestAsyncHandler(paginate));

purchaseRouter.patch("/:id", updateModel, requestAsyncHandler(update));
purchaseRouter.get("/:id/view", requestAsyncHandler(htmlView));
purchaseRouter.get("/:id/download", requestAsyncHandler(download));
purchaseRouter.post("/:id/payment", requestAsyncHandler(payment));
module.exports = purchaseRouter;
