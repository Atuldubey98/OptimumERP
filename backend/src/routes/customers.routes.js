const { Router } = require("express");
const {
  getAllCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomer,
  searchCustomer,
  getInvoicesForCustomer,
  getCustomerTransactions,
} = require("../controllers/customer.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");

const customerRouter = Router({ mergeParams: true });
customerRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  paginateModel,
  getAllCustomer
);
customerRouter.get(
  "/search",
  authenticate,
  checkOrgAuthorization,
  searchCustomer
);
customerRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createCustomer
);
customerRouter.patch(
  "/:customerId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updateCustomer
);
customerRouter.get(
  "/:customerId",
  authenticate,
  checkOrgAuthorization,
  getCustomer
);
customerRouter.get(
  "/:customerId/invoices",
  authenticate,
  checkOrgAuthorization,
  getInvoicesForCustomer
);
customerRouter.get(
  "/:customerId/transactions",
  authenticate,
  checkOrgAuthorization,
  getCustomerTransactions
);
customerRouter.delete(
  "/:customerId",
  authenticate,
  checkOrgAuthorization,
  deleteCustomer
);
module.exports = customerRouter;
