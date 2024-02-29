const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
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
  createExpense,
} = require("../controllers/expenses.controller");

const expenseRouter = Router({ mergeParams: true });

expenseRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  paginateModel,
  getAllExpenses
);

expenseRouter.post("/", authenticate, checkOrgAuthorization, createExpense);

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
expenseRouter.delete(
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
