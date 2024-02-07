const Joi = require("joi");

exports.createCustomerDto = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  shippingAddress: Joi.string().min(2).max(80),
  billingAddress: Joi.string().min(3).max(80).required(),
  gstNo: Joi.string(),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string(),
  panNo: Joi.string(),
  org: Joi.string().required(),
});

exports.updateCustomerDto = Joi.object({
  name: Joi.string().min(2).max(80),
  shippingAddress: Joi.string().min(2).max(80),
  billingAddress: Joi.string().min(3).max(80),
  gstNo: Joi.string(),
  updatedBy: Joi.string(),
  org : Joi.string(),
  panNo: Joi.string(),
  createdBy: Joi.string().required(),
  createdAt : Joi.string().optional(),
  updatedAt : Joi.string().optional(),
});
