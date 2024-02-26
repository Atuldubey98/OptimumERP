const Joi = require("joi");
const createProductDto = Joi.object({
  name: Joi.string().required().label("Name").max(150),
  costPrice: Joi.number().label("Cost Price"),
  sellingPrice: Joi.number().label("Selling Price"),
  description: Joi.string().max(200).allow(""),
  um : Joi.string().default("NONE").optional(),
  category: Joi.string()
    .valid("goods", "service")
    .required()
    .label("Type of Product"),
  code: Joi.string().label("HSN Code or SAC Code").allow(""),
  createdBy: Joi.string().label("Created By"),
});
const updateProductDto = Joi.object({
  name: Joi.string().required().label("Name").max(150).optional(),
  costPrice: Joi.number().label("Cost Price").optional(),
  sellingPrice: Joi.number().label("Selling Price").optional(),
  description: Joi.string().allow("").max(200).optional(),
  category: Joi.string()
    .valid("goods", "service")
    .required()
    .label("Type of Product")
    .optional(),
  um : Joi.string().default("NONE").optional(),
  code: Joi.string().label("HSN Code or SAC Code").optional(),
  updatedBy : Joi.string().label("Updated By")
});
module.exports = { createProductDto, updateProductDto };
