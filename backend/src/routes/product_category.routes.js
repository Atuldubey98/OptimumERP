const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");

const {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
  searchProductCategory,
} = require("../controllers/product_category.controller");
const productCategoryRouter = Router({
  mergeParams: true,
});

productCategoryRouter.post(
  "/",
  limitFreePlanOnCreateEntityForOrganization("productCategories"),
  createProductCategory
);
productCategoryRouter.get("/search", searchProductCategory);
productCategoryRouter.get("/", getAllProductCategories);

productCategoryRouter.get("/:id", getProductCategoryById);
productCategoryRouter.patch("/:id", updateProductCategory);
productCategoryRouter.delete("/:id", deleteProductCategory);

module.exports = productCategoryRouter;
