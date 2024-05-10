const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { createModel } = require("../middlewares/crud.middleware");
const {
  createSaleOrder,
  getSaleOrders,
  getSaleOrder,
  getNextSaleOrderNumber,
} = require("../controllers/sale_orders.controller");
const saleOrderRouter = Router({
  mergeParams: true,
});

saleOrderRouter.post(
  "/",
  authenticate,
  checkOrgAuthorization,
  createModel,
  createSaleOrder
);

saleOrderRouter.get(
  "/nextSoNo",
  authenticate,
  checkOrgAuthorization,
  getNextSaleOrderNumber
);
saleOrderRouter.get("/", authenticate, checkOrgAuthorization, getSaleOrders);
saleOrderRouter.get("/:id", authenticate, checkOrgAuthorization, getSaleOrder);

module.exports = saleOrderRouter;
