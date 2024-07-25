const Joi = require("joi");

const createOrgDto = Joi.object({
  name: Joi.string().min(2).max(80).required().label("Name"),
  address: Joi.string().required().label("Address"),
  gstNo: Joi.string().allow("").label("GST No."),
  createdBy: Joi.string().required(),
  financialYear: Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }).required(),
  panNo: Joi.string().label("PAN No."),
});

const updateOrgDto = Joi.object({
  name: Joi.string().min(2).max(80).label("Name"),
  address: Joi.string().label("Address"),
  gstNo: Joi.string().allow("").label("GST No."),
  financialYear: Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }).label("Financial Year"),
  panNo: Joi.string().length(10).label("PAN No."),
  telephone: Joi.string().allow("").optional().label("Telephone"),
  web: Joi.string().allow("").optional().label("Website"),
  email: Joi.string().email().allow("").optional().label("Email"),
});

module.exports = {
  createOrgDto,
  updateOrgDto,
};
