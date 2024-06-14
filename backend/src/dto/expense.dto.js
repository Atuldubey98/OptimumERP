const Joi = require("joi");

const expenseDto = Joi.object({
  description: Joi.string().required().label("Description"),
  amount: Joi.number().required().label("Amount"),
  category: Joi.string().allow(null),
  date: Joi.string().optional(),
  createdBy: Joi.string().optional(),
  updatedBy: Joi.string().optional(),
});

module.exports = { expenseDto };
