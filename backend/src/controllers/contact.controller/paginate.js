const entities = require("../../constants/entities");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../../services/crud.service");
const Contact = require("../../models/contacts.model");
const contactService = require("../../services/contact.service");

const paginate = async (req, res) => {
  const { filter, page, limit, skip, total, totalPages } =
    await getPaginationParams({
      req,
      model: Contact,
      modelName: entities.CONTACTS,
    });
  const contacts = await contactService.getAll({
    filter,
    skip,
    limit,
    sort: { createdAt: -1 },
  });
  const reachedLimit = hasUserReachedCreationLimits({
    relatedDocsCount: res.locals.organization.relatedDocsCount,
    userLimits: req.session.user.limits,
    key: "contacts",
  });
  return res.status(200).json({
    currentPage: page,
    limit,
    totalPages,
    total,
    data: contacts,
    reachedLimit,
  });
};

module.exports = paginate;
