const { Schema, model, Types } = require("mongoose");
const Property = require("./properties.model");
const termsSchema = {
  type: String,
  default: "Thanks for business !",
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
    type: {
      bank: {
        type: Boolean,
        default: false,
      },
      upiQr: {
        type: Boolean,
        default: false,
      },
      defaultTemplate: {
        type: String,
        default: "simple",
        required : true,
      },
    },
    validate : {
      validator : async function(v){
        const property = await Property.findOne({name : "TEMPLATES_CONFIG", "value.value" : v.defaultTemplate}).lean();
        return property != null;
      },
      message : props => `${props.value} is not a valid print setting`
    }
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
