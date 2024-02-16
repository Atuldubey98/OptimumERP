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
      type: String,
      enum: ["goods", "service"],
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
