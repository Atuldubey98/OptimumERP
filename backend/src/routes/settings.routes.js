const { Router } = require("express");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { signatureUploader } = require("../middlewares/uploader.middleware");

const { limitEntityCreation } = require("../middlewares/auth.middleware");

const {
  getSettingByOrg,
  update,
  providers,
  templates,
  uploadSignature,
  removeSignature,
} = require("../controllers/setting.controller");
const settingRouter = Router({ mergeParams: true });

settingRouter.get("/templates", requestAsyncHandler(templates.list));
settingRouter.post("/templates", limitEntityCreation("templates"), requestAsyncHandler(templates.create));
settingRouter.patch("/templates/default", requestAsyncHandler(templates.setDefault));
settingRouter.patch("/templates/:id", requestAsyncHandler(templates.update));
settingRouter.delete("/templates/:id", requestAsyncHandler(templates.remove));

settingRouter.get("/", requestAsyncHandler(getSettingByOrg));
settingRouter.patch("/", requestAsyncHandler(update));
settingRouter.post("/ai-providers", requestAsyncHandler(providers.create));
settingRouter.delete("/ai-providers/:providerId", requestAsyncHandler(providers.remove));
settingRouter.patch("/ai-providers/:providerId/active", requestAsyncHandler(providers.setActive));
settingRouter.patch("/ai-providers/:providerId/model", requestAsyncHandler(providers.updateDefaultModel));
settingRouter.patch("/ai-providers/:providerId/default", requestAsyncHandler(providers.setDefault));

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
