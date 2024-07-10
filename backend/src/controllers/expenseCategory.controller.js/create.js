const { expenseCategoryDto } = require("../../dto/expenseCategory.dto");
const logger = require("../../logger");
const ExpenseCategory = require("../../models/expenseCategory.model");
const OrgModel = require("../../models/org.model");

const create = async (req, res) => {
  const body = await expenseCategoryDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const category = new ExpenseCategory(body);
  await category.save();
  logger.info(`created expense category ${category.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.expenseCategories": 1 } }
  );
  return res.status(201).json(category);
};

module.exports = create;
