const { Schema, Types, model } = require("mongoose");

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    shippingAddress: {
      type: String,
      maxLength: 80,
    },
    billingAddress: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 80,
    },
    gstNo: {
      type: String,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    panNo: {
      type: String,
    },
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);
customerSchema.index({
  name: "text",
  billingAddress: "text",
  shippingAddress: "text",
});
const Customer = model("customer", customerSchema);
module.exports = Customer;
