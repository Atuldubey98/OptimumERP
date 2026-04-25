const Joi = require("joi");
const expenseCategoryDto = Joi.object({
  name: Joi.string().label("Name").required().max(80),
  description: Joi.string().label("Description").optional().max(150).allow(""),
  enabled: Joi.boolean().label("Enabled").optional(),
  createdBy: Joi.string().label("Created By").required(),
  updatedBy: Joi.string().optional(),
  org: Joi.string().optional(),
}).options({ stripUnknown: true });

module.exports = { expenseCategoryDto };
