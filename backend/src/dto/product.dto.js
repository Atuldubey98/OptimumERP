const Joi = require("joi");

const productDto = Joi.object({
  name: Joi.string().required().label("Name"),
  costPrice: Joi.number().integer().label("Cost Price"),
  sellingPrice: Joi.number().integer().label("Selling Price"),
  description: Joi.string().max(200).allow(""),
  um: Joi.string().optional(),
  type: Joi.string()
    .valid("goods", "service")
    .required()
    .label("Type of Product"),
  code: Joi.string().label("HSN Code or SAC Code").allow(""),
  category: Joi.string().optional().allow(null),
  createdBy: Joi.string().label("Created By"),
  updatedBy: Joi.string().label("Updated By").optional(),
}).options({ stripUnknown: true });

module.exports = { productDto };
