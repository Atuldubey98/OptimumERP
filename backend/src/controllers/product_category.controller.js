const requestAsyncHandler = require("../handlers/requestAsync.handler");
const ProductCategory = require("../models/product_category.model");

exports.createProductCategory = requestAsyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const newProductCategory = new ProductCategory({ name, description });
  await newProductCategory.save();
  return res.status(201).json({ data: newProductCategory });
});

exports.getAllProductCategories = requestAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalDocuments = await ProductCategory.countDocuments();
  const productCategories = await ProductCategory.find()
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    data: productCategories,
    page,
    limit,
    totalPages,
    total: totalDocuments,
  });
});

exports.getProductCategoryById = requestAsyncHandler(async (req, res) => {
  const productCategory = await ProductCategory.findById(req.params.id);
  if (!productCategory)
    return res.status(404).json({ message: "Product category not found" });
  return res.status(200).json(productCategory);
});

exports.updateProductCategory = requestAsyncHandler(async (req, res) => {
  const updatedProductCategory = await ProductCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedProductCategory) {
    return res.status(404).json({ message: "Product category not found" });
  }
  return res.status(200).json(updatedProductCategory);
});

exports.deleteProductCategory = requestAsyncHandler(async (req, res) => {
  const deletedProductCategory = await ProductCategory.findByIdAndDelete(
    req.params.id
  );
  if (!deletedProductCategory) {
    return res.status(404).json({ message: "Product category not found" });
  }
  return res
    .status(200)
    .json({ message: "Product category deleted successfully" });
});
