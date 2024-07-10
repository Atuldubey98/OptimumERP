const { Router } = require("express");
const {
  authenticate,
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  paginateModel,
  createModel,
  updateModel,
} = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const {
  create,
  read,
  paginate,
  remove,
  update,
} = require("../controllers/expenses.controller");
const expenseRouter = Router({ mergeParams: true });

expenseRouter.get("/", paginateModel, requestAsyncHandler(paginate));

expenseRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("expenses"),
  requestAsyncHandler(create)
);

expenseRouter.get("/:expenseId", requestAsyncHandler(read));
expenseRouter.delete("/:expenseId", requestAsyncHandler(remove));
expenseRouter.patch("/:expenseId", updateModel, requestAsyncHandler(update));

module.exports = expenseRouter;
