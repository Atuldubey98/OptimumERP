const Joi = require("joi");
const recurringInvoicesPeriods = require("../constants/recurringInvoicesPeriods");
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
const recurringInvoicesSchema = Joi.object({
  name: Joi.string().required(),
  party: Joi.string().required(),
  billingAddress: Joi.string().required(),
  poNo: Joi.string().optional(),
  poDate: Joi.string().optional(),
  items: Joi.array()
    .items(itemSchema)
    .required()
    .label("Recurring Invoice Items"),
  startDate: Joi.string().required(),
  terms: Joi.string().optional(),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string().optional(),
  period: Joi.string()
    .valid(...recurringInvoicesPeriods.map((period) => period.value))
    .required(),
  recurrenceNumber: Joi.number().required(),
  status: Joi.string().required(),
});

module.exports = recurringInvoicesSchema;
