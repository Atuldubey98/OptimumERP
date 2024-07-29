const { Schema, model, Types } = require("mongoose");
const termsSchema = {
  type: String,
  default: "Thanks for business !",
  required: true,
};
const settingSchema = new Schema({
  org: {
    type: Types.ObjectId,
    required: true,
    ref: "organization",
    unique: true,
  },
  transactionPrefix: {
    type: {
      invoice: String,
      quotation: String,
      purchaseOrder: String,
      proformaInvoice: String,
      saleOrder: String,
    },
    default: {
      invoice: "",
      quotation: "",
      purchaseOrder: "",
      proformaInvoice: "",
      saleOrder: "",
    },
  },
  prefixes: {
    type: {
      invoice: [String],
      quotation: [String],
      purchaseOrder: [String],
      proformaInvoice: [String],
    },
    default: {
      invoice: [""],
      quotation: [""],
      purchaseOrder: [""],
      proformaInvoice: [""],
    },
  },
  currency: {
    type: String,
    default: "INR",
    required: true,
  },
  localeCode: {
    type: String,
    default: "en-IN",
    required: true,
  },
  financialYear: {
    _id: false,
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
  printSettings: {
    bank: {
      type: Boolean,
      default: false,
    },
    upiQr: {
      type: Boolean,
      default: false,
    },
  },
  receiptDefaults: {
    um: {
      type: Types.ObjectId,
      ref: "ums",
      required: true,
    },
    tax: {
      type: Types.ObjectId,
      ref: "taxes",
      required: true,
    },
    terms: {
      invoice: termsSchema,
      quote: termsSchema,
      purchaseOrder: termsSchema,
      proformaInvoice: termsSchema,
    },
  },
});

const Setting = model("setting", settingSchema);

module.exports = Setting;
