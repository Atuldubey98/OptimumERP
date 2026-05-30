const { Schema, model, Types } = require("mongoose");
const Property = require("./properties.model");
const termsSchema = {
  type: String,
  default: "Thanks for business !",
};
const sequenceCounterSchema = {
  type: Number,
  min: 0,
  default: 0,
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
      paymentVoucher: String,
    },
    default: {
      invoice: "",
      quotation: "",
      purchaseOrder: "",
      proformaInvoice: "",
      paymentVoucher: ""
    },
  },
  prefixes: {
    type: {
      invoice: [String],
      quotation: [String],
      purchaseOrder: [String],
      proformaInvoice: [String],
      paymentVoucher: [String],
    },
    default: {
      invoice: [""],
      quotation: [""],
      purchaseOrder: [""],
      proformaInvoice: [""],
      paymentVoucher: [""],
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
  sequenceCounters: {
    _id: false,
    type: {
      invoice: sequenceCounterSchema,
      quotation: sequenceCounterSchema,
      purchaseOrder: sequenceCounterSchema,
      proformaInvoice: sequenceCounterSchema,
      paymentVoucher: sequenceCounterSchema,
      unReadNotifications: sequenceCounterSchema,
    },
    default: {
      invoice: 0,
      quotation: 0,
      purchaseOrder: 0,
      proformaInvoice: 0,
      paymentVoucher: 0,
      unReadNotifications: 0,
    },
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
        required: true,
      },
    },
    validate: {
      validator: async function (v) {
        const property = await Property.findOne({ name: "TEMPLATES_CONFIG", "value.value": v.defaultTemplate }).lean();
        return property != null;
      },
      message: props => `${props.value} is not a valid print setting`
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
  aiProviders: {
    type: [
      {
        provider: {
          type: String,
          enum: ["grok", "ollama"],
        },
        fields: {
          apiKey: String,
          defaultModel: String,
        },
        name: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length <= 3;
      },
      message: (props) => `${props.path} exceeds the limit of 3 AI providers`,
    },
  },
  smtpProviders: {
    type: [
      {
        provider: {
          type: String,
          enum: ["gmail", "brevo"],
        },
        fields: {
          user: String,
          pass: String,
          port: Number,
          secure: Boolean,
        },
        name: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length <= 3;
      },
      message: (props) => `${props.path} exceeds the limit of 3 SMTP providers`,
    },
  },
  signature: {
    type: String,
  }
});

settingSchema.index({ org: 1, "aiProviders.name": 1 }, { unique: true });

const Setting = model("setting", settingSchema);

module.exports = Setting;
