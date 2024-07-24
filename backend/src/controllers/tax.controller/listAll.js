const { TAXES } = require("../../constants/entities");
const Tax = require("../../models/tax.model");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");

const listAll = async (req, res) => {
  const shouldPaginate = req.params.paginate;
  const { filter, total, limit, page, skip, totalPages } =
    await getPaginationParams({
      model: Tax,
      modelName: TAXES,
      req,
      shouldPaginate,
    });
  const taxes = await Tax.find(filter).populate("children");
  return res.status(200).json({
    data: taxes,
    total,
    limit,
    page,
    skip,
    totalPages,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "taxes",
    }),
  });
};

module.exports = listAll;
