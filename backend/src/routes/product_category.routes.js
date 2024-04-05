const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
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
  authenticate,
  checkOrgAuthorization,
  createProductCategory
);
productCategoryRouter.get(
  "/search",
  authenticate,
  checkOrgAuthorization,
  searchProductCategory
);
productCategoryRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  getAllProductCategories
);

productCategoryRouter.get(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  getProductCategoryById
);
productCategoryRouter.patch(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  updateProductCategory
);
productCategoryRouter.delete(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  deleteProductCategory
);

module.exports = productCategoryRouter;
