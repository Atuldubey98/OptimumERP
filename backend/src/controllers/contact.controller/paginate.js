const entities = require("../../constants/entities");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../../services/crud.service");
const Contact = require("../../models/contacts.model");

const paginate = async (req, res) => {
  const { filter, page, limit, skip, total, totalPages } =
    await getPaginationParams({
      req,
      model: Contact,
      modelName: entities.CONTACTS,
    });
  const contacts = await Contact.find(filter)
    .populate("party")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res.status(200).json({
    currentPage: page,
    limit,
    totalPages,
    total,
    data: contacts,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "contacts",
    }),
  });
};

module.exports = paginate;
