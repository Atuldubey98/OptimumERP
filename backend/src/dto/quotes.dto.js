const Joi = require("joi");
const itemSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  um: Joi.string().default("none"),
  gst: Joi.string().default("none"),
});

const quoteDto = Joi.object({
  customer: Joi.string().required().label("Customer"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Quotation Items"),
  date: Joi.date().required().label("Quotation date"),
  quoteNo: Joi.number()
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
