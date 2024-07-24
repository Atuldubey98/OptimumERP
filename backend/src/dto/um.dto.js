const Joi = require("joi");
const umDto = Joi.object({
  name: Joi.string().max(20).required(),
  description: Joi.string().max(80).optional(),
  unit: Joi.string().max(10).required(),
  enabled: Joi.boolean().default(true),
  createdBy: Joi.string().hex().length(24).required(),
  updatedBy: Joi.string().hex().length(24).optional(),
});

module.exports = { umDto };
