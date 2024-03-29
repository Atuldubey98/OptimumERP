const Joi = require("joi");

exports.createPartyDto = Joi.object({
  name: Joi.string().min(2).max(80).required().label("Name"),
  shippingAddress: Joi.string().allow("").max(80).label("Shipping address"),
  billingAddress: Joi.string().min(3).max(80).required().label("Billing address"),
  gstNo: Joi.string().label("GST Number").allow(""),
  createdBy: Joi.string().required().label("Created by"),
  updatedBy: Joi.string().label("Updated by"),
  panNo: Joi.string().label("Pan Number").allow(""),
  org: Joi.string().required().label("Organization"),
});

exports.updatePartyDto = Joi.object({
  name: Joi.string().min(2).max(80).label("Party name"),
  shippingAddress: Joi.string().allow("").max(80).label("Shipping address"),
  billingAddress: Joi.string().min(3).max(80).label("Billing Address"),
  gstNo: Joi.string().allow("").label("GST No"),
  updatedBy: Joi.string().label("Updated By"),
  org : Joi.string().label("Organization"),
  panNo: Joi.string().label("Pan No").allow(""),
});
