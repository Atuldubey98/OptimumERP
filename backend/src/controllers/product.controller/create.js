const { productDto } = require("../../dto/product.dto");
const { OrgNotFound } = require("../../errors/org.error");
const OrgModel = require("../../models/org.model");
const Product = require("../../models/product.model");
const productService = require("../../services/product.service")
const create = async (req, res) => {
  const body = await productDto.validateAsync(req.body);
  if (!req.params.orgId) throw new OrgNotFound();
  body.org = req.params.orgId;
  const newProduct = await productService.create(body)
  return res.status(201).json({
    data: newProduct,
    message: req.t("common:api.product_created"),
  });
};

module.exports = create;
