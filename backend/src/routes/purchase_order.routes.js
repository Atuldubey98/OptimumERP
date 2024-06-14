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
  getNextPurchaseOrderNumber,
  deletePurchaseOrder,
  viewPurchaseOrder,
  downloadPurchaseOrder,
  getPurchaseOrder,
  updatePurchaseOrder,
} = require("../controllers/purchase_order.controller");

const purchaseOrderRouter = Router({ mergeParams: true });

purchaseOrderRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("purchaseOrders"),
  createPurchaseOrder
);

purchaseOrderRouter.get("/nextPurchaseOrderNo", getNextPurchaseOrderNumber);
purchaseOrderRouter.delete("/:id", deletePurchaseOrder);
purchaseOrderRouter.get("/:id", getPurchaseOrder);
purchaseOrderRouter.patch("/:id", updatePurchaseOrder);
purchaseOrderRouter.get("/", paginateModel, getPurchaseOrders);
purchaseOrderRouter.get("/:id/view", viewPurchaseOrder);
purchaseOrderRouter.get("/:id/download", downloadPurchaseOrder);
module.exports = purchaseOrderRouter;
