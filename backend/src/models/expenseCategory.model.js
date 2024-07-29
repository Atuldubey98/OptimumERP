const mongoose = require("mongoose");

const expenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 80,
    },
    description: {
      type: String,
      maxLength: 150,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    org: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "organization",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "expense_categories",
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
