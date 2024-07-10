const { Router } = require("express");
const {
  read,
  create,
  paginate,
  remove,
  update,
} = require("../controllers/contact.controller");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const contactRouter = Router({ mergeParams: true });
contactRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("contacts"),
  requestAsyncHandler(create)
);
contactRouter.get("/:id", requestAsyncHandler(read));
contactRouter.get("/", requestAsyncHandler(paginate));
contactRouter.patch("/:id", updateModel, requestAsyncHandler(update));
contactRouter.delete("/:id", requestAsyncHandler(remove));

module.exports = contactRouter;
