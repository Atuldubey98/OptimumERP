const { Router } = require("express");
const {
  createNewUserForOrg,
  getOrg,
  createOrg,
  getOrgsOfUser
} = require("../controllers/org.controller");
const authenticate = require("../middlewares/authentication.middleware");
const { createModel } = require("../middlewares/crud.middleware");

const organizationRouter = Router();
organizationRouter.post("/", authenticate, createModel, createOrg);
organizationRouter.get("/", authenticate, getOrgsOfUser);
organizationRouter.get("/:id", authenticate, getOrg);
organizationRouter.post("/users", authenticate, createNewUserForOrg);
module.exports = organizationRouter;
