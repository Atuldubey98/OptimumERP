const Joi = require("joi");

const productDto = Joi.object({
  name: Joi.string().required().label("Name").max(150),
  costPrice: Joi.number().label("Cost Price"),
  sellingPrice: Joi.number().label("Selling Price"),
  description: Joi.string().max(200).allow(""),
  um: Joi.string().default("NONE").optional(),
  type: Joi.string()
    .valid("goods", "service")
    .required()
    .label("Type of Product"),
  code: Joi.string().label("HSN Code or SAC Code").allow(""),
  category: Joi.string().optional().allow(null),
  createdBy: Joi.string().label("Created By"),
  updatedBy: Joi.string().label("Updated By").optional(),
});

module.exports = { productDto };
