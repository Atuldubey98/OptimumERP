const { Schema, Types, model } = require("mongoose");
const Property = require("./properties.model");

const paymentVoucherSchema = new Schema(
  {
    org: {
      type: Types.ObjectId,
      required: true,
      ref: "organization",
    },
    party: {
      type: Types.ObjectId,
      ref: "party",
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
    voucherType: {
      type: String,
      enum: ["receipt", "payment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      validate: {
        validator: async function (value) {
          if (!value) return true;
          const payment = await Property.findOne({
            name: "PAYMENT_METHODS",
            "value.value": value,
          });
          return Boolean(payment);
        },
        message: () => `Payment method does not exist`,
      },
    },
    description: {
      type: String,
      maxLength: 200,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    refDoc: {
      type: Types.ObjectId,
      refPath: "refDocModel",
    },
    refDocModel: {
      type: String,
      enum: ["invoice", "purchase"],
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
  },
  { timestamps: true, versionKey: false }
);

paymentVoucherSchema.index({ org: 1, createdAt: -1 });
paymentVoucherSchema.index({
  "financialYear.start":1,
  "financialYear.end":-1,
  num: "text",
});

const PaymentVoucher = model("payment_voucher", paymentVoucherSchema);

module.exports = PaymentVoucher;