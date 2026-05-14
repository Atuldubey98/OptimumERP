const { Schema, Types, model } = require("mongoose");
const { baseBillFields } = require("./common.model");

const purchaseInvoice = new Schema(
  {
    ...baseBillFields,
    paymentVouchers: [{
      type: Types.ObjectId,
      ref: "payment_voucher",
    }],
    paymentVoucherBalance: {
      type: Number,
      default: 0,
    },
    num: {
      ...baseBillFields.num,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
      enum: ["paid", "unpaid"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

purchaseInvoice.index({
  description: "text",
});
purchaseInvoice.index({ num: 1 });
purchaseInvoice.index({ org: 1, createdAt: -1 });

const Purchase = model("purchase", purchaseInvoice);

module.exports = Purchase;

