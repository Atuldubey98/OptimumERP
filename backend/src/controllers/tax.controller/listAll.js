const { TAXES } = require("../../constants/entities");
const Tax = require("../../models/tax.model");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");
const { getTaxListForOrg } = require("../../services/tax.service");

const listAll = async (req, res) => {
  const shouldPaginate = req.params.paginate;
  const { filter, total, limit, page, skip, totalPages } =
    await getPaginationParams({
      model: Tax,
      modelName: TAXES,
      req,
      shouldPaginate,
    });
  const shouldUseCachedOrgTaxList = !req.query.search;
  const taxes = shouldUseCachedOrgTaxList
    ? await getTaxListForOrg(req.params.orgId)
    : await Tax.find(filter).populate("children");
  return res.status(200).json({
    data: taxes,
    total: shouldUseCachedOrgTaxList ? taxes.length : total,
    limit,
    page,
    skip,
    totalPages: shouldUseCachedOrgTaxList ? Math.ceil(taxes.length / limit) : totalPages,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "taxes",
    }),
  });
};

module.exports = listAll;
