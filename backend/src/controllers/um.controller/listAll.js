const Um = require("../../models/um.model");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");
const { getUmListForOrg } = require("../../services/um.service");
const listAll = async (req, res) => {
  const { filter } = await getPaginationParams({
    model: Um,
    modelName: Um.modelName,
    req,
    shouldPaginate: false,
  });
  const shouldUseCachedOrgUmList = !req.query.search;
  const ums = shouldUseCachedOrgUmList
    ? await getUmListForOrg(req.params.orgId)
    : await Um.find(filter).lean();
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
