const Joi = require("joi");

exports.createCustomerDto = Joi.object({
  name: Joi.string().min(2).max(80).required().label("Name"),
  shippingAddress: Joi.string().min(2).max(80).label("Shipping address"),
  billingAddress: Joi.string().min(3).max(80).required().label("Billing address"),
  gstNo: Joi.string().label("GST Number"),
  createdBy: Joi.string().required().label("Created by"),
  updatedBy: Joi.string().label("Updated by"),
  panNo: Joi.string().label("Pan Number"),
  org: Joi.string().required().label("Organization"),
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
