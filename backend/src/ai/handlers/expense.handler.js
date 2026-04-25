const expenseService = require("../../services/expense.service");
const expenseCategoryService = require("../../services/expenseCategory.service");
const { expenseDto } = require("../../dto/expense.dto");
const { getDisplaySettingForOrg } = require("../../services/setting.service");
const { moneyUtils } = require("../../utils");
const Expense = require("../../models/expense.model");

const expenseHandlers = {
  list_expenses: async (params) => {
    try {
      const displaySetting = await getDisplaySettingForOrg(params.org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const fromSmallest = (val) => moneyUtils.fromSmallestUnit(val, decimalDigits);

      const filter = { org: params.org };
      if (params.category) {
        const categories = await expenseCategoryService.getExpenseCategoryListForOrg(params.org);
        const category = categories.find(c => 
          c.name.toLowerCase().includes(params.category.toLowerCase())
        );
        if (category) filter.category = category._id;
      }

      if (params.date) {
        const startOfDay = new Date(params.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(params.date);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: startOfDay, $lte: endOfDay };
      } else if (params.startDate || params.endDate) {
        filter.date = {};
        if (params.startDate) filter.date.$gte = new Date(params.startDate);
        if (params.endDate) filter.date.$lte = new Date(params.endDate);
      }

      const expenses = await Expense.find(filter)
        .populate("category")
        .sort({ date: -1 })
        .limit(20)
        .lean();

      return expenses.map(e => ({
        ...e,
        amount: fromSmallest(e.amount),
        category: e.category?.name || "Uncategorized"
      }));
    } catch (error) {
      throw error;
    }
  },

  create_expense: async ({ org, ...params }) => {
    try {
      const displaySetting = await getDisplaySettingForOrg(org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const toSmallest = (val) => moneyUtils.toSmallestUnit(val, decimalDigits);

      let categoryId = null;
      if (params.category) {
        const categories = await expenseCategoryService.getExpenseCategoryListForOrg(org);
        let category = categories.find(c => 
          c.name.toLowerCase() === params.category.toLowerCase()
        );

        if (!category) {
          category = await expenseCategoryService.create({
            name: params.category,
            org: org
          });
          expenseCategoryService.invalidateExpenseCategoryCache(org);
        }
        categoryId = category._id.toString();
      }

      const rawParams = {
        ...params,
        category: categoryId,
        amount: toSmallest(params.amount),
        org
      };

      const body = await expenseDto.validateAsync(rawParams);
      body.org = org;

      const expense = await expenseService.createExpense(body);
      return expense;
    } catch (error) {
      throw error;
    }
  },

  list_expense_categories: async (params) => {
    try {
      return await expenseCategoryService.getExpenseCategoryListForOrg(params.org);
    } catch (error) {
      throw error;
    }
  },

  create_expense_category: async (params) => {
    try {
      const category = await expenseCategoryService.create(params);
      expenseCategoryService.invalidateExpenseCategoryCache(params.org);
      return category;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = expenseHandlers;
