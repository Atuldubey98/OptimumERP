const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  paginate,
  create,
  read,
  bulkCreate,
  remove,
  update,
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", requestAsyncHandler(paginate));
productRouter.post("/bulk", createModel, requestAsyncHandler(bulkCreate));
productRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("products"),
  requestAsyncHandler(create)
);
productRouter.patch("/:productId", updateModel, requestAsyncHandler(update));
productRouter.get("/:productId", requestAsyncHandler(read));
productRouter.delete("/:productId", requestAsyncHandler(remove));
module.exports = productRouter;
