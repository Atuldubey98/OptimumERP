const ProductCategory = require("../../models/productCategory.model");
const {
  hasUserReachedCreationLimits,
  getPaginationParams,
} = require("../../services/crud.service");
const { getProductCategoryListForOrg } = require("../../services/productCategory.service");

const entities = require("../../constants/entities");
const paginate = async (req, res) => {
  const { skip, limit, page, total, filter, totalPages } =
    await getPaginationParams({
     query : req.query,
      params :req.params,
      model: ProductCategory,
      modelName: entities.PRODUCT_CATEGORIES,
    });
  const shouldUseCachedOrgCategoryList = !req.query.search;
  const productCategories = shouldUseCachedOrgCategoryList
    ? await getProductCategoryListForOrg(req.params.orgId)
    : await ProductCategory.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
  return res.status(200).json({
    data: productCategories,
    currentPage: page,
    limit,
    totalPages: shouldUseCachedOrgCategoryList
      ? Math.ceil(productCategories.length / limit)
      : totalPages,
    totalCount: shouldUseCachedOrgCategoryList ? productCategories.length : total,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "productCategories",
    }),
  });
};

module.exports = paginate;
