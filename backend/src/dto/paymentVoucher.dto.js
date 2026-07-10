const Joi = require("joi");

const baseVoucherFields = {
  description: Joi.string().allow("").label("Description"),
  amount: Joi.number().integer().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().label("Date"),
  party: Joi.string().label("Party"),
  voucherType: Joi.string().valid("receipt", "payment").label("Voucher Type"),
  refDoc: Joi.string().allow(null).label("Reference Document"),
  refDocModel: Joi.string().valid("invoice", "purchase").allow(null).label("Reference Document Model"),
};

const createPaymentVoucherDto = Joi.object({
  ...baseVoucherFields,
  party: baseVoucherFields.party.allow(null),
  amount: baseVoucherFields.amount.required(),
  date: baseVoucherFields.date.required(),
  voucherType: baseVoucherFields.voucherType.required(),
  createdBy: Joi.string().optional().label("Created By"),
  org: Joi.string().optional().label("Organization"),
}).options({ stripUnknown: true });

const updatePaymentVoucherDto = Joi.object({
  ...baseVoucherFields,
  updatedBy: Joi.string().optional().label("Updated By"),
}).options({ stripUnknown: true }).min(1);

const addPaymentDto = Joi.object({
  description: baseVoucherFields.description.required(),
  amount: baseVoucherFields.amount.required(),
  paymentMode: baseVoucherFields.paymentMode,
  date: baseVoucherFields.date.required(),
}).options({ stripUnknown: true });

module.exports = {
  createPaymentVoucherDto,
  updatePaymentVoucherDto,
  addPaymentDto,
};
