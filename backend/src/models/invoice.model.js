const { Schema, Types, model } = require("mongoose");
const Party = require("./party.model");
const Property = require("./properties.model");
const invoiceSchema = new Schema(
  {
    party: {
      type: Types.ObjectId,
      required: true,
      ref: "party",
      validate: {
        validator: async function (value) {
          const party = await Party.findOne({ org: this.org, _id: value });
          return party !== null;
        },
        message: () => `Party does not exist`,
      },
    },
    payment: {
      _id: false,
      type: {
        amount: {
          type: Number,
        },
        paymentMode: {
          type: String,
        },
        description: {
          type: String,
        },
        date: {
          type: Date,
        },
      },
      validate: {
        validator: async function (value) {
          const payment = await Property.findOne({
            name: "PAYMENT_METHODS",
            "value.value": value.paymentMode,
          });
          return Boolean(payment);
        },
        message: () => `Payment method does not exist`,
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
              taxValue >= 0,
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
  },
);
invoiceSchema.index({
  description: "text",
  num: "text",
});
invoiceSchema.index({ org: 1, createdAt: -1 });
invoiceSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "invoice_org_fin_year_sequence_unique" },
);

const Invoice = model("invoice", invoiceSchema);

module.exports = Invoice;
