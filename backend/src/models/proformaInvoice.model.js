const { Types, Schema, model } = require("mongoose");
const { baseBillFields } = require("./common.model");

const proformaInvoiceSchema = new Schema(
  {
    ...baseBillFields,
    poNo: {
      type: String,
      default: "",
    },
    poDate: {
      type: Date,
    },
    sequence: {
      ...baseBillFields.sequence,
      required: true,
      min: 1,
    },
    num: {
      ...baseBillFields.num,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
      enum: ["draft", "sent", "pending"],
    },
    converted: {
      type: Types.ObjectId,
      ref: "invoice",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

proformaInvoiceSchema.index({
  description: "text",
  poNo: "text",
});
proformaInvoiceSchema.index({ num: 1 });
proformaInvoiceSchema.index({ org: 1, createdAt: -1 });
proformaInvoiceSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "proforma_invoice_org_fin_year_sequence_unique" },
);

const ProformaInvoice = model("proforma_invoice", proformaInvoiceSchema);

module.exports = ProformaInvoice;

