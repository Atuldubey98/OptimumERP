const Joi = require("joi");
const itemSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  um: Joi.string().default("none"),
  code : Joi.string().default("HSN/SAC Code").allow(""),
  gst: Joi.string().default("none"),
});

const quoteDto = Joi.object({
  party: Joi.string().required().label("Party"),
  description: Joi.string().optional().allow("").label("Description"),
  billingAddress: Joi.string().required().label("Party Address"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Quotation Items"),
  date: Joi.date().required().label("Quotation date"),
  sequence: Joi.number()
    .required()
    .label("Quote No."),
  status: Joi.string()
    .default("draft")
    .valid("draft", "pending", "sent", "accepted", "declined")
    .label("Status"),
  createdBy: Joi.string().optional().label("Created By"),
  updatedBy: Joi.string().optional().label("Updated By"),
}).options({ stripUnknown: true });

module.exports = { quoteDto };
