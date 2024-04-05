const { Schema, Types, model } = require("mongoose");

const partySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    shippingAddress: {
      type: String,
      maxLength: 150,
    },
    billingAddress: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 150,
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
  { timestamps: true, versionKey: false, collection: "parties" }
);
partySchema.index({
  name: "text",
  billingAddress: "text",
  shippingAddress: "text",
});
const Party = model("party", partySchema);
module.exports = Party;
