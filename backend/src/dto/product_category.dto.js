const Joi = require("joi");

const productCategoryDto = Joi.object({
  name: Joi.string().required().min(3).max(80),
  description: Joi.string().required().min(3).max(150),
});

module.exports = productCategoryDto;
