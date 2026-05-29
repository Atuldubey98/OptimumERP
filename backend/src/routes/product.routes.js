const { Router } = require("express");
const {
  limitEntityCreation,
} = require("../middlewares/auth.middleware");
const {
  paginate,
  create,
  read,
  bulkCreate,
  remove,
  update,
  importProducts,
} = require("../controllers/product.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const productRouter = Router({
  mergeParams: true,
});

productRouter.get("/", requestAsyncHandler(paginate));
productRouter.post("/import", upload.single("file"), requestAsyncHandler(importProducts));
productRouter.post("/bulk", createModel, requestAsyncHandler(bulkCreate));
productRouter.post(
  "/",
  createModel,
  limitEntityCreation("products"),
  requestAsyncHandler(create)
);
productRouter.patch("/:productId", updateModel, requestAsyncHandler(update));
productRouter.get("/:productId", requestAsyncHandler(read));
productRouter.delete("/:productId", requestAsyncHandler(remove));
module.exports = productRouter;
