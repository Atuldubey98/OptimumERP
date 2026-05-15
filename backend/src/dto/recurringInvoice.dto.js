const Joi = require("joi");

const itemSchema = Joi.object({
  name: Joi.string().required().label("Item name"),
  price: Joi.number().integer().required().label("Price"),
  quantity: Joi.number().required().label("Quantity"),
  code: Joi.string().allow("").optional().label("Code"),
  um: Joi.string().label("Unit of measurement"),
  tax: Joi.string().label("GST applicable"),
  product: Joi.string().allow("", null).optional().label("Product ID"),
});

const baseRecurringInvoiceFields = {
  party: Joi.string().required().label("Party"),
  billingAddress: Joi.string().required().label("Billing Address"),
  description: Joi.string().optional().allow("").label("Description"),
  terms: Joi.string().optional().allow("").label("Terms and Conditions"),
  items: Joi.array().items(itemSchema).required().label("Invoice Items"),
  shippingCharges: Joi.number().integer().min(0).default(0).label("Shipping Charges"),
  org: Joi.string().optional().label("Organization"),
  poNo: Joi.string().label("PO Number").allow("").optional(),
  poDate: Joi.string().label("PO Date").allow("").optional(),
  status: Joi.string()
    .valid("paused", "active", "cancelled")
    .default("active")
    .label("Status"),
  generateInvoice: Joi.boolean().default(true).label("Generate Invoice"),
  generateProformaInvoice: Joi.boolean().default(false).label("Generate Proforma Invoice"),
};

const frequencyFields = {
  interval: Joi.string()
    .valid("weekly", "monthly", "yearly", "quarterly", "triannually", "semiannually", "half_yearly", "daily")
    .required()
    .label("Interval"),
  startDate: Joi.date().required().label("Start Date"),
  endDate: Joi.date().required().label("End Date"),
  dateOfEveryMonth: Joi.number().min(1).max(31).optional().label("Date of every month"),
  dayOfEveryWeek: Joi.string()
    .valid("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday")
    .optional()
    .label("Day of every week"),
};

const createRecurringInvoiceDto = Joi.object({
  ...baseRecurringInvoiceFields,
  ...frequencyFields,
  createdBy: Joi.string().optional().label("Created By"),
}).options({ stripUnknown: true });

const updateRecurringInvoiceDto = Joi.object({
  ...baseRecurringInvoiceFields,
  updatedBy: Joi.string().optional().label("Updated By"),
}).options({ stripUnknown: true });

module.exports = {
  createRecurringInvoiceDto,
  updateRecurringInvoiceDto,
};
