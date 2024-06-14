const { Router } = require("express");
const {
  createContact,
  getContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../controllers/contact.controller");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");

const contactRouter = Router({ mergeParams: true });
contactRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("contacts"),
  createContact
);
contactRouter.get("/:id", getContact);
contactRouter.get("/", getContacts);
contactRouter.patch("/:id", updateModel, updateContact);
contactRouter.delete("/:id", deleteContact);

module.exports = contactRouter;
