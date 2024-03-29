const { Schema, Types, model } = require("mongoose");
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
      enum: ["invoice", "purchase", "expense", "quotes"],
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
  },
  { timestamps: true, versionKey: false }
);

const Transaction = model("transaction", transactionSchema);
module.exports = Transaction;
