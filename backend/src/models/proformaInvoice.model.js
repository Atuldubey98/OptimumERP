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

const ProformaInvoice = model("proforma_invoice", proformaInvoiceSchema);
proformaInvoiceSchema.index({
  num: "text",
  description: "text",
});
module.exports = ProformaInvoice;
