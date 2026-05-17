const { Router } = require("express");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { signatureUploader } = require("../middlewares/uploader.middleware");

const {
  getSettingByOrg,
  update,
  providers,
  uploadSignature,
  removeSignature,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/", requestAsyncHandler(getSettingByOrg));
settingRouter.patch("/", requestAsyncHandler(update));
settingRouter.post("/ai-providers", requestAsyncHandler(providers.create));
settingRouter.delete("/ai-providers/:providerId", requestAsyncHandler(providers.remove));
settingRouter.patch("/ai-providers/:providerId/active", requestAsyncHandler(providers.setActive));

settingRouter.post("/smtp-providers", requestAsyncHandler(providers.createSmtp));
settingRouter.delete("/smtp-providers/:providerId", requestAsyncHandler(providers.removeSmtp));
settingRouter.patch("/smtp-providers/:providerId/active", requestAsyncHandler(providers.setActiveSmtp));

settingRouter.post(
  "/signature",
  signatureUploader.single("signature"),
  requestAsyncHandler(uploadSignature)
);
settingRouter.delete(
  "/signature",
  requestAsyncHandler(removeSignature)
);

module.exports = settingRouter;
