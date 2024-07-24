const { Schema, Types, model } = require("mongoose");

const quoteSchema = new Schema(
  {
    party: {
      type: Types.ObjectId,
      required: true,
      ref: "party",
    },
    billingAddress: {
      type: String,
      required: true,
    },
    converted: {
      type: Types.ObjectId,
      ref: "invoice",
    },
    total: {
      type: Number,
      default: 0,
      required: true,
    },
    totalTax: {
      type: Number,
      default: 0,
      required: true,
    },
    taxCategories: {
      sgst: {
        type: Number,
        min: 0,
      },
      cgst: {
        type: Number,
        min: 0,
      },
      igst: {
        type: Number,
        min: 0,
      },
      vat: {
        type: Number,
        min: 0,
      },
      cess: {
        type: Number,
        min: 0,
      },
      sal: {
        type: Number,
        min: 0,
      },
      others: {
        type: Number,
        min: 0,
      },
    },
    num: {
      type: String,
      default: "",
    },
    prefix: {
      type: String,
      default: "",
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
    sequence: {
      type: Number,
      required: true,
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
      default: "draft",
      enum: ["draft", "pending", "sent", "accepted", "declined"],
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
const Quotes = model("quotes", quoteSchema);
quoteSchema.index({
  description: "text",
  num: "text",
});
module.exports = Quotes;
