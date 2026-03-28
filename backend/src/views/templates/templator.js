const simpleTemplate = require("./simple.template");
const borderLandTemplate = require("./borderLand.template");
const buzyTemplate = require("./buzy.template");
const i18 = require("../../i18");
/**
 *
 * @param {string} template
 */
const templator = (template) => {
  const templates = {
    simple: simpleTemplate,
    borderLand: borderLandTemplate,
    buzy : buzyTemplate,
  };
  const runner = templates[template];
  if (!runner) throw new Error(i18.t("common:api.no_template_found"));
  return runner;
};

module.exports = templator;
