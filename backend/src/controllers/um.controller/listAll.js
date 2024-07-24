const Um = require("../../models/um.model");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");
const listAll = async (req, res) => {
  const { filter } = await getPaginationParams({
    model: Um,
    modelName: Um.modelName,
    req,
    shouldPaginate: false,
  });
  const ums = await Um.find(filter);
  return res.status(200).json({
    data: ums,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "ums",
    }),
  });
};

module.exports = listAll;
