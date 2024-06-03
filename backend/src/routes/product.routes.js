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
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", authenticate, checkOrgAuthorization, getAllProducts);
productRouter.post("/bulk", addManyProducts);
productRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("products"),
  createProduct
);
productRouter.patch("/:productId", updateModel, updateProduct);
productRouter.get("/:productId", getProduct);
productRouter.delete("/:productId", deleteProduct);
module.exports = productRouter;
