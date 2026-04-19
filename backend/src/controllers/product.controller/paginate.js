const entities = require("../../constants/entities");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../../services/crud.service");
const Product = require("../../models/product.model");

const paginate = async (req, res) => {
  const { filter, limit, page, skip, total, totalPages } =
    await getPaginationParams({
      query : req.query,
      params :req.params,
      model: Product,
      modelName: entities.PRODUCTS,
    });
  const products = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("category")
    .populate("um")
    .lean()
    .exec();
  return res.status(200).json({
    data: products,
    page,
    limit,
    totalCount: total,
    totalPages,
    message: req.t("common:api.products_retrieved"),
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "products",
    }),
  });
};

module.exports = paginate;
