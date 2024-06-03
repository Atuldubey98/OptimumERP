const { Router } = require("express");

const {
  getSetting,
  updateSetting,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/", getSetting);
settingRouter.patch("/", updateSetting);
module.exports = settingRouter;
