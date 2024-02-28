const { Router } = require("express");
const authenticate = require("../middlewares/authentication.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { paginateModel } = require("../middlewares/crud.middleware");
const {
  getAllExpenses,
  getAllExpenseCategories,
  getExpense,
  deleteExpense,
  updateExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} = require("../controllers/expenses.controller");

const expenseRouter = Router({ mergeParams: true });

expenseRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  paginateModel,
  getAllExpenses
);

expenseRouter.get(
  "/categories",
  authenticate,
  checkOrgAuthorization,
  getAllExpenseCategories
);

expenseRouter.post(
  "/categories",
  authenticate,
  checkOrgAuthorization,
  createExpenseCategory
);

expenseRouter.patch(
  "/categories/:categoryId",
  authenticate,
  checkOrgAuthorization,
  updateExpenseCategory
);
expenseRouter.delete(
  "/categories/:categoryId",
  authenticate,
  checkOrgAuthorization,
  deleteExpenseCategory
);
expenseRouter.get(
  "/:expenseId",
  authenticate,
  checkOrgAuthorization,
  getExpense
);
expenseRouter.get(
  "/:expenseId",
  authenticate,
  checkOrgAuthorization,
  deleteExpense
);
expenseRouter.patch(
  "/:expenseId",
  authenticate,
  checkOrgAuthorization,
  updateExpense
);

module.exports = expenseRouter;
