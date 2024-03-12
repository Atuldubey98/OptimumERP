const { Schema, Types, model } = require("mongoose");

const purchaseInvoice = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      required: true,
      ref: "customer",
    },
    billingAddress: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
      required: true,
    },
    totalTax: {
      type: Number,
      default: 0,
      required: true,
    },
    sgst: {
      type: Number,
      default: 0,
      min: 0,
    },
    cgst: {
      type: Number,
      default: 0,
      min: 0,
    },
    igst: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: "Thanks for the business.",
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
    purchaseNo: {
      type: String,
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
      enum: ["paid", "unpaid"],
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
const Purchase = model("purchase", purchaseInvoice);
purchaseInvoice.index({
  description: "text",
});
module.exports = Purchase;
