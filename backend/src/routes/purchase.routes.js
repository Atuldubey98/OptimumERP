const { Router } = require("express");
const { authenticate, limitFreePlanOnCreateEntityForOrganization } = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  createPurchase,
  getPurchase,
  deletePurchase,
  getPurchases,
  updatePurchase,
  viewPurchaseBill,
  downloadPurchaseInvoice,
  payoutPurchase,
} = require("../controllers/purchase.controller");

const purchaseRouter = Router({
  mergeParams: true,
});

purchaseRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  limitFreePlanOnCreateEntityForOrganization("purchases"),
  createPurchase
);
purchaseRouter.get(
  "/:purchaseId",
  authenticate,
  checkOrgAuthorization,
  getPurchase
);
purchaseRouter.delete(
  "/:purchaseId",
  authenticate,
  checkOrgAuthorization,
  deletePurchase
);
purchaseRouter.get("/", authenticate, checkOrgAuthorization, getPurchases);

purchaseRouter.patch(
  "/:purchaseId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updatePurchase
);
purchaseRouter.get(
  "/:purchaseId/view",
  authenticate,
  checkOrgAuthorization,
  viewPurchaseBill
);
purchaseRouter.get(
  "/:purchaseId/download",
  authenticate,
  checkOrgAuthorization,
  downloadPurchaseInvoice
);
purchaseRouter.post(
  "/:purchaseId/payment",
  authenticate,
  checkOrgAuthorization,
  payoutPurchase
);
module.exports = purchaseRouter;
