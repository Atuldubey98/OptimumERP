const { Router } = require("express");
const {
  getAllCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomer,
} = require("../controllers/customer.controller");
const authenticate = require("../middlewares/authentication.middleware");
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
  getAllCustomer
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
customerRouter.delete(
  "/:customerId",
  authenticate,
  checkOrgAuthorization,
  deleteCustomer
);
module.exports = customerRouter;
