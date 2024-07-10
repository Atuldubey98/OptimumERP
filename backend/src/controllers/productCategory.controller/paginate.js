const ProductCategory = require("../../models/productCategory.model");
const {
  hasUserReachedCreationLimits,
  getPaginationParams,
} = require("../../helpers/crud.helper");

const entities = require("../..//constants/entities");
const paginate = async (req, res) => {
  const { skip, limit, page, total, filter, totalPages } =
    await getPaginationParams({
      req,
      model: ProductCategory,
      modelName: entities.PRODUCT_CATEGORIES,
    });
  const productCategories = await ProductCategory.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return res.status(200).json({
    data: productCategories,
    currentPage: page,
    limit,
    totalPages,
    totalCount: total,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "productCategories",
    }),
  });
};

module.exports = paginate;
