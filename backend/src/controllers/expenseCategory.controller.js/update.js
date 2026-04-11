const {
  ExpenseCategoryNotFound,
} = require("../../errors/expenseCategory.error");

const expenseCategoryService = require("../../services/expenseCategory.service");

const update = async (req, res) => {
  if (!req.params.categoryId) throw new ExpenseCategoryNotFound();
  
  const category = await expenseCategoryService.update(
    { org: req.params.orgId, _id: req.params.categoryId },
    req.body
  );
  expenseCategoryService.invalidateExpenseCategoryCache(req.params.orgId);
  return res.status(200).json({ data: category });
};

module.exports = update;
