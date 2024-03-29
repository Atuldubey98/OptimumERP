const { Types } = require("mongoose");
const { Schema, model } = require("mongoose");

const productCategorySchema = new Schema(
  {
    name: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
    },
    description: {
      type: String,
      minLength: 3,
      maxLength: 80,
      default: "",
    },
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection : "product_categories"
  }
);
productCategorySchema.index({
  name: "text",
});
const ProductCategory = model("product_category", productCategorySchema);

module.exports = ProductCategory;
