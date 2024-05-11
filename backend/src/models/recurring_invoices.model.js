const { Schema, Types, model } = require("mongoose");
const recurringInvoicesPeriods = require("../constants/recurringInvoicesPeriods");
const recurringInvoiceSchema = new Schema(
  {
    party: {
      type: Types.ObjectId,
      required: true,
      ref: "parties",
    },
    name: {
      type: String,
      required: true,
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
      enum: recurringInvoicesPeriods.map(
        (recurrInvoicesPeriod) => recurrInvoicesPeriod.value
      ),
      required: true,
    },
    lastInvoiceDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
    },
    recurrenceNumber: {
      type: Number,
      required: true,
    },
    noOfInvoicesGenerated: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RecurringInvoice = model("recurring_invoice", recurringInvoiceSchema);

module.exports = RecurringInvoice;
