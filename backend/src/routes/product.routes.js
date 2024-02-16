const { Router } = require("express");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const authenticate = require("../middlewares/authentication.middleware");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", authenticate, checkOrgAuthorization, getAllProducts);
productRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createProduct
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
