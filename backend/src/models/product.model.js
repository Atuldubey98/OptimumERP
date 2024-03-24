const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "product_category",
    },
    type: {
      type: String,
      enum: ["service", "goods"],
      required: true,
    },
    code: {
      type: String,
    },
    org: {
      type: mongoose.Types.ObjectId,
      ref: "organization",
      required: true,
    },
    um: {
      type: String,
      default: "none",
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "user",
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
productSchema.index({
  name: "text",
  description: "text",
});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
