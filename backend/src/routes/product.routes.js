const { Router } = require("express");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {authenticate} = require("../middlewares/auth.middleware");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  addManyProducts,
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", authenticate, checkOrgAuthorization, getAllProducts);
productRouter.post("/bulk", authenticate, checkOrgAuthorization, addManyProducts);
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
