const { Router } = require("express");
const {
  create,
  listAll,
  remove,
  toggleEnable,
} = require("../controllers/tax.controller");
const { createModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const taxRouter = Router({
  mergeParams: true,
});

taxRouter.post("/", createModel, requestAsyncHandler(create));
taxRouter.get("/", requestAsyncHandler(listAll));
taxRouter.patch("/:id", requestAsyncHandler(toggleEnable));
taxRouter.delete("/:id", requestAsyncHandler(remove));

module.exports = taxRouter;
