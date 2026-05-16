const { Schema, Types, model } = require("mongoose");
const { baseBillFields } = require("./common.model");

const quoteSchema = new Schema(
  {
    ...baseBillFields,
    converted: {
      type: Types.ObjectId,
      ref: "invoice",
    },
    sequence: {
      ...baseBillFields.sequence,
      required: true,
    },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "pending", "sent", "accepted", "declined"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

quoteSchema.index({
  description: "text",
});
quoteSchema.index({ num: 1 });
quoteSchema.index({ org: 1, createdAt: -1 });
quoteSchema.index({ org: 1, party: 1 });
quoteSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "quotes_org_fin_year_sequence_unique" },
);

const Quotes = model("quotes", quoteSchema);

module.exports = Quotes;

