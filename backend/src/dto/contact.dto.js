const Joi = require("joi");

const contactDto = Joi.object({
  name: Joi.string().label("Name").required().min(2).max(40),
  email: Joi.string().label("Email").email().max(40).required(),
  party: Joi.string().optional().allow(null).default(null),
  telephone: Joi.string().label("Telephone").optional().allow(""),
  description: Joi.string().allow("").optional().max(80),
  type: Joi.string().default("unknown"),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string().optional(),
}).options({ stripUnknown: true });

module.exports = { contactDto };
