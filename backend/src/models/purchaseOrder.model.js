const { Schema, Types, model } = require("mongoose");

const purchaseOrderSchema = new Schema(
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
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    total: {
      type: Number,
      default: 0,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    num: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
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
    num: {
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
      enum: ["draft", "sent", "paid"],
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

const PurchaseOrder = model("purchase_order", purchaseOrderSchema);
purchaseOrderSchema.index({
  num: "text",
  description: "text",
});
module.exports = PurchaseOrder;
