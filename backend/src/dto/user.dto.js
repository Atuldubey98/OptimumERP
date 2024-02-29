const Joi = require("joi");
const registerUserDto = Joi.object({
  name: Joi.string().min(3).max(60).required(),
  email: Joi.string().email().lowercase().min(5).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().default("user").optional(),
});

const loginUserDto = Joi.object({
  email: Joi.string().email().lowercase().min(5).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
});
module.exports = { registerUserDto, loginUserDto };
