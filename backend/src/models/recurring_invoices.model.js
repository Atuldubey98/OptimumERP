const { Schema, Types, model } = require("mongoose");
const recurringInvoiceSchema = new Schema(
  {
    party: {
      type: Types.ObjectId,
      required: true,
      ref: "parties",
    },
    org: {
      type: Types.ObjectId,
      required: true,
      ref: "organization",
    },
    billingAddress: {
      type: String,
      required: true,
    },
    poNo: {
      type: String,
      default: "",
    },
    poDate: {
      type: Date,
    },
    terms: {
      type: String,
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
    period: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "biannually"],
      required: true,
    },
    lastInvoiceDate: {
      type: Date,
    },
    recurrenceNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required : true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RecurringInvoice = model("recurring_invoice", recurringInvoiceSchema);

module.exports = RecurringInvoice;
