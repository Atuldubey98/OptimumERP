const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      maxLength : 150,
    },
    org: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "organization",
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "expense_category",
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
expenseSchema.index({
  description: "text",
});
expenseSchema.index({ org: 1, category: 1 });

const Expense = mongoose.model("expense", expenseSchema);

module.exports = Expense;
