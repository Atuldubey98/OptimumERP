const simpleTemplate = require("./simple.template");
const borderLandTemplate = require("./borderLand.template");
const buzyTemplate = require("./buzy.template");
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
  if (!runner) throw new Error("No template found");
  return runner;
};

module.exports = templator;
