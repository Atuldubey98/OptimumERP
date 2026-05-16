const entities = require("../../constants/entities");
const { getPaginationParams, hasUserReachedCreationLimits } = require("../../services/crud.service");

const paginate = async (options = {}, req, res) => {
  const { Bill, relatedDocType } = options;
  const { filter, skip, limit, total, totalPages, page, hasTextSearch } =
    await getPaginationParams({
      query: req.query,
      params: req.params,
      modelName: entities.INVOICES,
      model: Bill,
    });
  let query = Bill.find(filter);

  if (hasTextSearch) {
    query = query
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const bills = await query
    .populate("party")
    .populate("org")
    .select(req.query.select)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return res.status(200).json({
    data: bills,
    page,
    limit,
    totalPages,
    total,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: relatedDocType,
    }),
  });
};

module.exports = paginate;
