const { Router } = require("express");
const {
  create,
  downloadPartyTransactionSummary,
  getTransactionSummary,
  paginate,
  read,
  remove,
  searchByNameOrBA,
  update,
  migrate,
} = require("../controllers/party.controller");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");

const {
  createModel,
  updateModel,
  paginateModel,
} = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { spreadSheetUploader } = require("../middlewares/uploader.middleware");

const partyRouter = Router({ mergeParams: true });

partyRouter.get("/", paginateModel, requestAsyncHandler(paginate));
partyRouter.get("/search", requestAsyncHandler(searchByNameOrBA));
partyRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("parties"),
  requestAsyncHandler(create)
);
partyRouter.patch("/:partyId", updateModel, requestAsyncHandler(update));
partyRouter.get("/:partyId", requestAsyncHandler(read));
partyRouter.get(
  "/:partyId/transactions",
  requestAsyncHandler(getTransactionSummary)
);
partyRouter.get(
  "/:partyId/transactions/download",
  requestAsyncHandler(downloadPartyTransactionSummary)
);
partyRouter.delete("/:partyId", requestAsyncHandler(remove));
partyRouter.post("/migrate/:platform",
  createModel,
  requestAsyncHandler(migrate));
module.exports = partyRouter;
