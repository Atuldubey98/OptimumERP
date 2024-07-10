const { PARTIES } = require("../../constants/entities");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../../helpers/crud.helper");
const Party = require("../../models/party.model");

const paginate = async (req, res) => {
  const { skip, limit, total, totalPages, filter, page } =
    await getPaginationParams({
      req,
      model: Party,
      modelName: PARTIES,
    });

  const parties = await Party.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name active")
    .populate("updatedBy", "name active");

  return res.status(200).json({
    page,
    limit,
    totalPages,
    total,
    data: parties,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "parties",
    }),
  });
};

module.exports = paginate;
