const Joi = require("joi");

const createOrgDto = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  address: Joi.string().required(),
  gstNo: Joi.string(),
  createdBy: Joi.string().required(),
  financialYear: Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }).required(),
  panNo: Joi.string(),
});

const updateOrgDto = Joi.object({
  name: Joi.string().min(2).max(80),
  address: Joi.string(),
  gstNo: Joi.string().length(15),
  financialYear: Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }),
  panNo: Joi.string().length(10),
});

module.exports = {
  createOrgDto,
  updateOrgDto,
};
