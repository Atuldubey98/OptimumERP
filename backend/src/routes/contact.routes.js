const { Router } = require("express");
const {
  createContact,
  getContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../controllers/contact.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");

const contactRouter = Router({ mergeParams: true });
contactRouter.post(
  "/",
  authenticate,
  checkOrgAuthorization,
  createModel,
  createContact
);
contactRouter.get("/:id", authenticate, checkOrgAuthorization, getContact);
contactRouter.get("/", authenticate, checkOrgAuthorization, getContacts);
contactRouter.patch(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  updateModel,
  updateContact
);
contactRouter.delete(
  "/:id",
  authenticate,
  checkOrgAuthorization,
  deleteContact
);

module.exports = contactRouter;
