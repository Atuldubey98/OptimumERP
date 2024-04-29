const { Schema, Types, model } = require("mongoose");
function getTodayDate() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}
const transactionSchema = new Schema(
  {
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    docModel: {
      type: String,
      enum: ["invoice", "purchase", "expense", "quotes", "proforma_invoice", "sale_order", "purchase_order"],
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    party: {
      type: Types.ObjectId,
      ref: "party",
    },
    financialYear: {
      type: {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true,
        },
      },
      _id: false,
      required: true,
    },
    doc: {
      type: Types.ObjectId,
      required: true,
      refPath: "docModel",
    },
    date: {
      type: Date,
      required: true,
      default: getTodayDate,
    },
  },
  { timestamps: true, versionKey: false }
);

const Transaction = model("transaction", transactionSchema);
module.exports = Transaction;
