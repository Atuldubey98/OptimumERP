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
const {
  getAllExpenses,
  getAllExpenseCategories,
  getExpense,
  deleteExpense,
  updateExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createExpense,
  getExpenseCategory,
} = require("../controllers/expenses.controller");

const expenseRouter = Router({ mergeParams: true });

expenseRouter.get("/", paginateModel, getAllExpenses);

expenseRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("expenses"),
  createExpense
);

expenseRouter.get(
  "/categories",

  getAllExpenseCategories
);

expenseRouter.post(
  "/categories",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("expenseCategories"),
  createExpenseCategory
);

expenseRouter.patch(
  "/categories/:categoryId",
  updateModel,
  updateExpenseCategory
);

expenseRouter.get("/categories/:categoryId", getExpenseCategory);
expenseRouter.delete("/categories/:categoryId", deleteExpenseCategory);
expenseRouter.get("/:expenseId", getExpense);
expenseRouter.delete("/:expenseId", deleteExpense);
expenseRouter.patch("/:expenseId", updateExpense);

module.exports = expenseRouter;
