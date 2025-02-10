const simpleTemplate = require("./simple.template");
const borderLandTemplate = require("./borderLand.template");
/**
 *
 * @param {string} template
 */
const templator = (template) => {
  const templates = {
    simple: simpleTemplate,
    borderLand: borderLandTemplate,
  };
  const runner = templates[template];
  if (!runner) throw new Error("No template found");
  return runner;
};

module.exports = templator;
