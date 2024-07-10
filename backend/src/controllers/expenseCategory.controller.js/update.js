const {
  ExpenseCategoryNotFound,
} = require("../../errors/expenseCategory.error");
const logger = require("../../logger");
const ExpenseCategory = require("../../models/expenseCategory.model");

const update = async (req, res) => {
  if (!req.params.categoryId) throw new ExpenseCategoryNotFound();
  const category = await ExpenseCategory.findOneAndUpdate(
    {
      org: req.params.orgId,
      _id: req.params.categoryId,
    },
    req.body,
    {
      new: true,
    }
  );
  logger.info(`updated expense category ${category.id}`);
  if (!category) throw new ExpenseCategoryNotFound();
  return res.status(200).json({ data: category });
};

module.exports = update;
