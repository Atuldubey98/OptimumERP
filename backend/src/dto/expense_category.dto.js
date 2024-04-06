const Joi = require("joi");
const expenseCategoryDto = Joi.object({
  name: Joi.string().label("Name").required().max(80),
  description: Joi.string().label("Description").optional().max(150).allow(""),
  createdBy: Joi.string().label("Created By").required(),
  updatedBy: Joi.string().optional(),
});

module.exports = { expenseCategoryDto };
