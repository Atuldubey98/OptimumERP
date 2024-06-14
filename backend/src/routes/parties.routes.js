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
  downloadPartyTransactions,
} = require("../controllers/party.controller");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");

const partyRouter = Router({ mergeParams: true });
partyRouter.get("/", paginateModel, getAllParty);
partyRouter.get("/search", searchParty);
partyRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("parties"),
  createParty
);
partyRouter.patch("/:partyId", updateModel, updateParty);
partyRouter.get("/:partyId", getParty);
partyRouter.get("/:partyId/invoices", getInvoicesForParty);
partyRouter.get("/:partyId/transactions", getPartyTransactions);
partyRouter.get("/:partyId/transactions/download", downloadPartyTransactions);
partyRouter.delete("/:partyId", deleteParty);
module.exports = partyRouter;
