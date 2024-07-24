const Joi = require("joi");
const taxDto = Joi.object({
  name: Joi.string().required().max(8),
  description: Joi.string().max(80).allow(""),
  type: Joi.string().valid("single", "grouped").default("single").required(),
  category: Joi.string()
    .valid("igst", "sgst", "cgst", "vat", "cess", "sal", "others", "none")
    .required(),
  children: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  percentage: Joi.number().min(0).max(100).default(0),
  enabled: Joi.boolean().default(true).optional(),
  createdBy: Joi.string().required(),
});

module.exports = { taxDto };
