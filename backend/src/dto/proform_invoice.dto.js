const Joi = require("joi");
const itemSchema = Joi.object({
  name: Joi.string().required().label("Item name"),
  price: Joi.number().required().label("Price"),
  quantity: Joi.number().required().label("Quantity"),
  code: Joi.string().allow("").optional().label("Code"),
  um: Joi.string().default("none").label("Unit of measurement"),
  gst: Joi.string().default("none").label("GST applicable"),
});
const proformaInvoiceDto = Joi.object({
  party: Joi.string().required().label("Party"),
  billingAddress: Joi.string().required().label("Billing Address"),
  sequence : Joi.number().required().label("Proforma Invoice No"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Invoice Items"),
  date: Joi.date().required().label("Invoice date"),
  poNo: Joi.string().label("PO Number").allow("").optional(),
  poDate: Joi.string().label("PO Date").allow("").optional(),
  status: Joi.string()
    .default("draft")
    .valid("draft", "sent", "pending")
    .label("Status"),
  createdBy: Joi.string().optional().label("Created By"),
  updatedBy: Joi.string().optional().label("Updated By"),
});

module.exports = proformaInvoiceDto;
