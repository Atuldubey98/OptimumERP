const Joi = require("joi");
const itemSchema = Joi.object({
  name: Joi.string().required().label("Item name"),
  price: Joi.number().required().label("Price"),
  quantity: Joi.number().required().label("Quantity"),
  code: Joi.string().allow("").optional().label("Code"),
  um: Joi.string().default("none").label("Unit of measurement"),
  gst: Joi.string().default("none").label("GST applicable"),
});

const saleOrderDto = Joi.object({
  party: Joi.string().required().label("Party"),
  billingAddress: Joi.string().required().label("Billing Address"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Items"),
  date: Joi.date().required().label("Date"),
  soNo: Joi.number().label("SO Number").allow("").optional(),
  status: Joi.string()
    .default("draft")
    .valid("draft", "sent", "pending")
    .label("Status"),
  createdBy: Joi.string().required().label("Created By"),
  updatedBy: Joi.string().optional().label("Updated By"),
}).options({ stripUnknown: true });

module.exports = { saleOrderDto };
