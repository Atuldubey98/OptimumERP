const { TAXES } = require("../../constants/entities");
const Tax = require("../../models/tax.model");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");
const { getTaxListForOrg } = require("../../services/tax.service");

const listAll = async (req, res) => {
  const reachedLimit = hasUserReachedCreationLimits({
    relatedDocsCount: res.locals.organization.relatedDocsCount,
    userLimits: req.session.user.limits,
    key: "taxes",
  });

  if (!req.query.search) {
    const taxes = await getTaxListForOrg(req.params.orgId);
    return res.status(200).json({
      data: taxes,
      total: taxes.length,
      limit: taxes.length,
      page: 1,
      skip: 0,
      totalPages: 1,
      reachedLimit,
    });
  }

  const { filter, total, limit, page, skip, totalPages } =
    await getPaginationParams({
      model: Tax,
      modelName: TAXES,
      query: req.query,
      params: req.params,
      shouldPaginate: req.params.paginate,
    });
  const taxes = await Tax.find(filter).populate("children").lean();
  return res.status(200).json({
    data: taxes,
    total,
    limit,
    page,
    skip,
    totalPages,
    reachedLimit,
  });
};

module.exports = listAll;
