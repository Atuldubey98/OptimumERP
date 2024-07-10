const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");

const {
  create,
  paginate,
  read,
  remove,
  search,
  update,
} = require("../controllers/productCategory.controller");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const productCategoryRouter = Router({
  mergeParams: true,
});

productCategoryRouter.post(
  "/",
  limitFreePlanOnCreateEntityForOrganization("productCategories"),
  requestAsyncHandler(create)
);
productCategoryRouter.get("/search", requestAsyncHandler(search));
productCategoryRouter.get("/", requestAsyncHandler(paginate));

productCategoryRouter.get("/:id", requestAsyncHandler(read));
productCategoryRouter.patch("/:id", requestAsyncHandler(update));
productCategoryRouter.delete("/:id", requestAsyncHandler(remove));

module.exports = productCategoryRouter;
