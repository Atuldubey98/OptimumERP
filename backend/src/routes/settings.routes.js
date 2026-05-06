const { Router } = require("express");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const {
  getSettingByOrg,
  update,
  providers,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/", requestAsyncHandler(getSettingByOrg));
settingRouter.patch("/", requestAsyncHandler(update));
settingRouter.post("/ai-providers", requestAsyncHandler(providers.create));
settingRouter.delete("/ai-providers/:providerId", requestAsyncHandler(providers.remove));
settingRouter.patch("/ai-providers/:providerId/active", requestAsyncHandler(providers.setActive));
module.exports = settingRouter;
