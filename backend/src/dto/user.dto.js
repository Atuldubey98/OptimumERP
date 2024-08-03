const Joi = require("joi");
const registerJoi = {
  name: Joi.string().min(3).max(60).required(),
  email: Joi.string().email().lowercase().min(5).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().default("user").optional(),
};
const registerUserDto = Joi.object(registerJoi);

const orgUserDto = Joi.object({
  ...registerJoi,
  useAdminSMTP: Joi.boolean().default(false),
});
const loginUserDto = Joi.object({
  email: Joi.string().email().lowercase().min(5).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
});

const googleAuthBodyDto = Joi.object({
  code: Joi.string().required(),
  redirectUri: Joi.string().required(),
});
module.exports = {
  registerUserDto,
  loginUserDto,
  googleAuthBodyDto,
  orgUserDto,
};
