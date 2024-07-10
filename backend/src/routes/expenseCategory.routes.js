const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware.js");
const {
  create,
  update,
  remove,
  paginate,
  read,
} = require("../controllers/expenseCategory.controller.js/index.js");
const requestAsyncHandler = require("../handlers/requestAsync.handler.js");
const { updateModel, createModel } = require("../middlewares/crud.middleware.js");
const expenseCategoryRouter = Router({
  mergeParams: true,
});

expenseCategoryRouter.get("/", requestAsyncHandler(paginate));

expenseCategoryRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("expenseCategories"),
  requestAsyncHandler(create)
);

expenseCategoryRouter.patch(
  "/:categoryId",
  updateModel,
  requestAsyncHandler(update)
);

expenseCategoryRouter.get("/:categoryId", requestAsyncHandler(read));
expenseCategoryRouter.delete("/:categoryId", requestAsyncHandler(remove));

module.exports = expenseCategoryRouter;
