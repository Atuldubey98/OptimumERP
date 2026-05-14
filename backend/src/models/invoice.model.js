const { Schema, Types, model } = require("mongoose");
const Party = require("./party.model");
const { baseBillFields } = require("./common.model");

const invoiceSchema = new Schema(
  {
    ...baseBillFields,
    party: {
      ...baseBillFields.party,
      validate: {
        validator: async function (value) {
          const party = await Party.findOne({ org: this.org, _id: value });
          return party !== null;
        },
        message: () => `Party does not exist`,
      },
    },
    paymentVouchers: [{
      type: Types.ObjectId,
      ref: "payment_voucher",
    }],
    paymentVoucherBalance: {
      type: Number,
      default: 0,
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
    sequence: {
      ...baseBillFields.sequence,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
      enum: ["draft", "sent", "pending"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

invoiceSchema.index({
  description: "text",
});
invoiceSchema.index({ num: 1 });
invoiceSchema.index({ org: 1, createdAt: -1 });
invoiceSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "invoice_org_fin_year_sequence_unique" },
);

const Invoice = model("invoice", invoiceSchema);

module.exports = Invoice;

