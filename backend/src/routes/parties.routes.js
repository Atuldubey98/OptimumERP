const { Router } = require("express");
const {
  getAllParty,
  getParty,
  updateParty,
  deleteParty,
  createParty,
  searchParty,
  getInvoicesForParty,
  getPartyTransactions,
} = require("../controllers/party.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");

const partyRouter = Router({ mergeParams: true });
partyRouter.get(
  "/",
  authenticate,
  checkOrgAuthorization,
  paginateModel,
  getAllParty
);
partyRouter.get(
  "/search",
  authenticate,
  checkOrgAuthorization,
  searchParty
);
partyRouter.post(
  "/",
  authenticate,
  createModel,
  checkOrgAuthorization,
  createParty
);
partyRouter.patch(
  "/:partyId",
  authenticate,
  updateModel,
  checkOrgAuthorization,
  updateParty
);
partyRouter.get(
  "/:partyId",
  authenticate,
  checkOrgAuthorization,
  getParty
);
partyRouter.get(
  "/:partyId/invoices",
  authenticate,
  checkOrgAuthorization,
  getInvoicesForParty
);
partyRouter.get(
  "/:partyId/transactions",
  authenticate,
  checkOrgAuthorization,
  getPartyTransactions
);
partyRouter.delete(
  "/:partyId",
  authenticate,
  checkOrgAuthorization,
  deleteParty
);
module.exports = partyRouter;
