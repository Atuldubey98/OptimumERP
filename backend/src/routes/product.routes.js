const { Router } = require("express");
const {
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

productRouter.get("/", getAllProducts);
productRouter.post("/bulk", createModel, addManyProducts);
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
