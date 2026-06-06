const getSettingByOrg = require("./getSettingByOrg");
const update = require("./update");
const providers = require("./providers");
const templates = require("./templates");
const uploadSignature = require("./uploadSignature");
const removeSignature = require("./removeSignature");

module.exports = {
  getSettingByOrg,
  update,
  providers,
  templates,
  uploadSignature,
  removeSignature,
};
