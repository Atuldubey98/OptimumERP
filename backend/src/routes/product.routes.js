const { Router } = require("express");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  authenticate,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  addManyProducts,
  createManyProducts,
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", authenticate, checkOrgAuthorization, getAllProducts);
productRouter.post(
  "/bulk",
  authenticate,
  checkOrgAuthorization,
  addManyProducts
);
productRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  limitFreePlanOnCreateEntityForOrganization("products"),
  createProduct
);
productRouter.post(
  "/many",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createManyProducts
);
productRouter.patch(
  "/:productId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updateProduct
);
productRouter.get(
  "/:productId",
  authenticate,
  checkOrgAuthorization,
  getProduct
);
productRouter.delete(
  "/:productId",
  authenticate,
  checkOrgAuthorization,
  deleteProduct
);
module.exports = productRouter;
