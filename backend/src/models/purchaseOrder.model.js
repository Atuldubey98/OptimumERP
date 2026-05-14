const { Schema, Types, model } = require("mongoose");
const { baseBillFields } = require("./common.model");

const purchaseOrderSchema = new Schema(
  {
    ...baseBillFields,
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sequence: {
      ...baseBillFields.sequence,
      required: true,
    },
    num: {
      ...baseBillFields.num,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
      enum: ["draft", "sent", "paid"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

purchaseOrderSchema.index({
  description: "text",
});
purchaseOrderSchema.index({ num: 1 });
purchaseOrderSchema.index({ org: 1, createdAt: -1 });
purchaseOrderSchema.index(
  { org: 1, "financialYear.start": 1, sequence: 1 },
  { unique: true, name: "purchase_order_org_fin_year_sequence_unique" }
);

const PurchaseOrder = model("purchase_order", purchaseOrderSchema);

module.exports = PurchaseOrder;
