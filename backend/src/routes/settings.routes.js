const { Router } = require("express");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const {
  getSettingByOrg,
  update,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/", requestAsyncHandler(getSettingByOrg));
settingRouter.patch("/", requestAsyncHandler(update));
module.exports = settingRouter;
