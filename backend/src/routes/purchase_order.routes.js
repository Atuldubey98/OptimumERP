const { Router } = require("express");
const { authenticate, limitFreePlanOnCreateEntityForOrganization } = require("../middlewares/auth.middleware");
const {
  createModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createPurchaseOrder,
  getPurchaseOrders,
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
module.exports = purchaseOrderRouter;
