const { Schema, model, Types } = require("mongoose");
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
    },
    default: {
      invoice: "",
      quotation: "",
      purchaseOrder: "",
      proformaInvoice: "",
    },
  },
  currency: {
    type: String,
    default: "INR",
    required: true,
  },
  localeCode : {
    type :String,
    default : "en-IN"
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
});

const Setting = model("setting", settingSchema);

module.exports = Setting;
