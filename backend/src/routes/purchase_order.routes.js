const { Router } = require("express");
const {
  authenticate,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  createModel,
  paginateModel,
  updateModel,
} = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createPurchaseOrder,
  getPurchaseOrders,
  getNextPurchaseOrderNumber,
  getPurchaseOrder,
  updatePurchaseOrder,
  viewPurchaseOrder,
  downloadPurchaseOrder,
  deletePurchaseOrder,
} = require("../controllers/purchase_order.controller");
const purchaseOrderRouter = Router({ mergeParams: true });

purchaseOrderRouter.post(
  "/",
  authenticate,
  checkOrgAuthorization,
  createModel,
  limitFreePlanOnCreateEntityForOrganization("purchaseOrders"),
  createPurchaseOrder
);
purchaseOrderRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  paginateModel,
  getPurchaseOrders
);
purchaseOrderRouter.get(
  "/nextPoNo",
  authenticate,
  checkOrgAuthorization,
  getNextPurchaseOrderNumber
);
purchaseOrderRouter.get(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  getPurchaseOrder
);
purchaseOrderRouter.delete(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  deletePurchaseOrder
);
purchaseOrderRouter.patch(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  updateModel,
  updatePurchaseOrder
);
purchaseOrderRouter.get(
  "/:id/view",
  authenticate,
  checkOrgAuthorization,
  viewPurchaseOrder
);
purchaseOrderRouter.get(
  "/:id/download",
  authenticate,
  checkOrgAuthorization,
  downloadPurchaseOrder
);

module.exports = purchaseOrderRouter;
