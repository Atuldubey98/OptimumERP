const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  createModel,
  paginateModel,
} = require("../middlewares/crud.middleware");

const {
  createPurchaseOrder,
  getPurchaseOrders,
} = require("../controllers/purchase_order.controller");
const purchaseOrderRouter = Router({ mergeParams: true });

purchaseOrderRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("purchaseOrders"),
  createPurchaseOrder
);
purchaseOrderRouter.get("/", paginateModel, getPurchaseOrders);
module.exports = purchaseOrderRouter;
