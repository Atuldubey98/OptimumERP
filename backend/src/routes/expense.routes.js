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
