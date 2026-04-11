
const expenseCategoryService = require("../../services/expenseCategory.service");
const read = async (req, res) => {
  const expenseCategory = await expenseCategoryService.read({
    org: req.params.orgId,
    _id: req.params.categoryId,
  });
  return res.status(200).json({ data: expenseCategory });
};

module.exports = read;
