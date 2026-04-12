const { Types } = require("mongoose");
const { Schema, model } = require("mongoose");

const proformaInvoiceSchema = new Schema({
  party: {
    type: Types.ObjectId,
    required: true,
    ref: "party",
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
  totalTax: {
    type: Number,
    default: 0,
    required: true,
  },
  shippingCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxCategories: {
    type: Object,
    default: {},
    validate: {
      validator: function (value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return false;
        }
        return Object.values(value).every(
          (taxValue) =>
            typeof taxValue === "number" &&
            Number.isFinite(taxValue) &&
            taxValue >= 0
        );
      },
      message: () =>
        "taxCategories must be an object with numeric percentage values between 0 and 100",
    },
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
        type: Types.ObjectId,
        ref: "ums",
        required: true,
      },
      tax: {
        type: Types.ObjectId,
        ref: "taxes",
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: new Date(Date.now()),
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
  sequence: {
    type: Number,
    required: true,
    min: 1,
  },
  num: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: "",
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
  converted: {
    type: Types.ObjectId,
    ref: "invoice",
  },
});

proformaInvoiceSchema.index({
  num: "text",
  description: "text",
});
proformaInvoiceSchema.index({ org: 1, createdAt: -1 });
proformaInvoiceSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "proforma_invoice_org_fin_year_sequence_unique" }
);

const ProformaInvoice = model("proforma_invoice", proformaInvoiceSchema);

module.exports = ProformaInvoice;
