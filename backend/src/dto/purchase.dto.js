const Joi = require("joi");
const itemSchema = Joi.object({
  name: Joi.string().required().label("Item name"),
  price: Joi.number().required().label("Price"),
  quantity: Joi.number().required().label("Quantity"),
  code: Joi.string().allow("").optional().label("Code"),
  um: Joi.string().default("none").label("Unit of measurement"),
  gst: Joi.string().default("none").label("GST applicable"),
});

const purchaseDto = Joi.object({
  customer: Joi.string().required().label("Customer"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms & Conditions"),
  items: Joi.array().items(itemSchema).required().label("Invoice Items"),
  date: Joi.date().required().label("Purchase Invoice date"),
  purchaseNo: Joi.string().label("Purchase No.").required(),
  status: Joi.string()
    .default("unpaid")
    .valid("unpaid", "paid")
    .label("Status"),
}).options({ stripUnknown: true });

module.exports = { purchaseDto };
