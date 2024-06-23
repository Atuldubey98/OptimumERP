const Joi = require("joi");
const ums = require("../constants/um");
const itemSchema = Joi.object({
  name: Joi.string().required().label("Item name"),
  price: Joi.number().required().label("Price"),
  quantity: Joi.number().required().label("Quantity"),
  code: Joi.string().allow("").optional().label("Code"),
  um: Joi.string()
    .valid(...ums.map((um) => um.value))
    .default("none")
    .label("Unit of measurement"),
  gst: Joi.string().default("none").label("GST applicable"),
});

const invoiceDto = Joi.object({
  party: Joi.string().required().label("Party"),
  billingAddress: Joi.string().required().label("Billing Address"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Invoice Items"),
  date: Joi.date().required().label("Invoice date"),
  prefix: Joi.string().required().allow("").label("Prefix"),
  org: Joi.string().optional().label("Organization"),
  sequence: Joi.number().label("Invoice No.").required(),
  poNo: Joi.string().label("PO Number").allow("").optional(),
  poDate: Joi.string().label("PO Date").allow("").optional(),
  dueDate: Joi.string().label("Due Date").allow("").optional(),
  status: Joi.string()
    .default("draft")
    .valid("draft", "sent", "pending")
    .label("Status"),
  createdBy: Joi.string().optional().label("Created By"),
  updatedBy: Joi.string().optional().label("Updated By"),
}).options({ stripUnknown: true });

module.exports = { invoiceDto };
