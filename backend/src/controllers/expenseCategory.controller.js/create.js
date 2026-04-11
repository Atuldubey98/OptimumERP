const { expenseCategoryDto } = require("../../dto/expenseCategory.dto");
const expenseCategorService = require("../../services/expenseCategory.service");
const create = async (req, res) => {
  const body = await expenseCategoryDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const category = await expenseCategorService.create(body);
  expenseCategorService.invalidateExpenseCategoryCache(req.params.orgId);
  return res.status(201).json(category);
};

module.exports = create;
