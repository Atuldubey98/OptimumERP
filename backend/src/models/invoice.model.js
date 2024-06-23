const { Schema, Types, model } = require("mongoose");
const paymentMethods = require("../constants/paymentMethods");

const invoiceSchema = new Schema(
  {
    party: {
      type: Types.ObjectId,
      required: true,
      ref: "party",
    },
    payment: {
      _id: false,
      type: {
        amount: {
          type: Number,
        },
        paymentMode: {
          type: String,
          enum: paymentMethods.map((method) => method.value),
        },
        description: {
          type: String,
        },
        date: {
          type: Date,
        },
      },
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
    poNo: {
      type: String,
      default: "",
    },
    poDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
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
    sequence: {
      type: Number,
      required: true,
    },
    prefix: {
      type: String,
      default: "",
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
      enum: ["draft", "sent", "pending"],
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
