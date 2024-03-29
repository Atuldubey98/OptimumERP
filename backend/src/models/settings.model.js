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
    },
    default: {
      invoice: "",
      quotation: "",
      purchaseOrder: "",
    },
  },
  currency: {
    type: String,
    default: "INR",
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
});

const Setting = model("setting", settingSchema);

module.exports = Setting;
