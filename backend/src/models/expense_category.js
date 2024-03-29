const mongoose = require("mongoose");

const expenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    org: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "organization",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection : "expense_categories"
  }
);

const ExpenseCategory = mongoose.model(
  "expense_category",
  expenseCategorySchema
);

expenseCategorySchema.index({
  name: "text",
});

module.exports = ExpenseCategory;
