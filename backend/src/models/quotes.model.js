const { Schema, Types, model } = require("mongoose");

const quoteSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      required: true,
      ref: "customer",
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
    num: {
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
    quoteNo: {
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
  quoteNo: "text",
});
module.exports = Quotes;
