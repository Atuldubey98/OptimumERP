const Joi = require("joi");

const contactDto = Joi.object({
  name: Joi.string().label("Name").required().min(2).max(40),
  email: Joi.string().label("Email").email().max(40).allow("").optional(),
  party: Joi.string().optional().allow(null).default(null),
  telephone: Joi.string().optional().allow(""),
  description: Joi.string().allow("").optional().max(80),
  type: Joi.string().required(),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string().optional(),
});

module.exports = { contactDto };
