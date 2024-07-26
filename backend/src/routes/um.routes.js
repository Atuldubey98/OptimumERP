const { Router } = require("express");
const {
  create,
  update,
  remove,
  listAll,
} = require("../controllers/um.controller");
const { createModel, updateModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const {
  limitFreePlanOnCreateEntityForOrganization,
} = require("../middlewares/auth.middleware");

const umRouter = Router({
  mergeParams: true,
});

umRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("ums"),
  requestAsyncHandler(create)
);
umRouter.get("/", requestAsyncHandler(listAll));
umRouter.patch("/:id", updateModel, requestAsyncHandler(update));
umRouter.delete("/:id", updateModel, requestAsyncHandler(remove));
module.exports = umRouter;
