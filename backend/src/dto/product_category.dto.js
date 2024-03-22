const Joi = require("joi");

const productCategoryDto = Joi.object({
  name: Joi.string().required().min(3).max(30),
  description: Joi.string().required().min(3).max(80),
});

module.exports = productCategoryDto;
