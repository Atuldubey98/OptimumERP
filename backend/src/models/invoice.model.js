const { Schema, Types, model } = require("mongoose");

const invoiceSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      required: true,
      ref: "customer",
    },
    total: {
      type: Number,
      default: 0,
      required: true,
    },
    poNo: {
      type: String,
      default: "",
    },
    poDate: {
      type: Date,
    },
    totalTax: {
      type: Number,
      default: 0,
      required: true,
    },
    description: {
      type: String,
      default: "Thanks for the business.",
    },
    terms: {
      type: String,
    },
    org: {
      type: Types.ObjectId,
      required: true,
      ref: "organization",
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          default: 0,
        },
        code: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
          default: 0,
        },
        um: {
          type: String,
          default: "none",
        },
        gst: {
          type: String,
          default: "none",
        },
      },
    ],
    date: {
      type: Date,
      default: new Date(Date.now()),
    },
    num: {
      type: String,
      default: "",
    },
    invoiceNo: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      default: "sent",
      enum: ["draft", "sent", "paid"],
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
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const Invoice = model("invoice", invoiceSchema);
invoiceSchema.index({
  description: "text",
  num: "text",
});
module.exports = Invoice;
