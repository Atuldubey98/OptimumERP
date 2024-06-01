const config = require("../constants/config");
const { isValidObjectId } = require("mongoose");

exports.getPaginationParams = async ({ req, modelName, model }) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {
    org: req.params.orgId,
  };
  switch (modelName) {
    case config.CONTACTS:
      if (req.query.search) filter.$text = { $search: req.query.search };
      if (req.query.type) filter.type = req.query.type;
      if (isValidObjectId(req.query.party)) filter.party = party;
      break;
    case config.EXPENSES:
      if (req.query.search) filter.$text = { $search: req.query.search };
      if (req.query.category) filter.category = category;
    default:
      break;
  }
  const total = await model.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  return { filter, page, limit, skip, total, totalPages };
};
