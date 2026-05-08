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
  let query = Product.find(filter);

  if (filter && filter.$text) {
    query = query
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const products = await query
    .skip(skip)
    .limit(limit)
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
