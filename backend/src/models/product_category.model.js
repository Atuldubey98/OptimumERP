const { Schema, model } = require("mongoose");

const productCategorySchema = new Schema({
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
});

const ProductCategory = model("product_categorie", productCategorySchema);

module.exports = ProductCategory;
