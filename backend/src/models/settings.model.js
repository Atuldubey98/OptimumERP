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
    },
    default: {
      invoice: "",
      quotation: "",
    },
  },
  counter: {
    type: {
      invoice: {
        type: Number,
        default: 0,
      },
      quotation: {
        type: Number,
        default: 0,
      },
    },
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
});

const Setting = model("setting", settingSchema);

module.exports = Setting;
