const { Router } = require("express");
const authenticate = require("../middlewares/authentication.middleware");

const {
  checkOrgAuthorization,
} = require("../middlewares/organization.middleware");
const {
  getSetting,
  updateSetting,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/", authenticate, checkOrgAuthorization, getSetting);
settingRouter.patch("/", authenticate, checkOrgAuthorization, updateSetting);
module.exports = settingRouter;
