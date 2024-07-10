const entities = require("../../constants/entities");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../helpers/crud.helper");

const paginate = async (options = {}, req, res) => {
  const { Bill } = options;
  const { filter, skip, limit, total, totalPages, page } =
    await getPaginationParams({
      req,
      modelName: entities.INVOICES,
      model: Bill,
    });
  const bills = await Bill.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();
  return res.status(200).json({
    data: bills,
    page,
    limit,
    totalPages,
    total,
    message: "Invoices retrieved successfully",
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "invoices",
    }),
  });
};

module.exports = paginate;
