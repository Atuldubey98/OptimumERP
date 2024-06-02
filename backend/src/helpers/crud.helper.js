const config = require("../constants/config");
const { isValidObjectId } = require("mongoose");

exports.getPaginationParams = async ({ req, modelName, model }) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {
    org: req.params.orgId,
  };
  if (req.query.search) filter.$text = { $search: req.query.search };
  switch (modelName) {
    case config.CONTACTS:
      if (req.query.type) filter.type = req.query.type;
      if (isValidObjectId(req.query.party)) filter.party = party;
      break;
    case config.EXPENSES || config.PRODUCTS:
      if (req.query.category) filter.category = category;
      break;
    case config.INVOICES || config.PROFORMA_INVOICES || config.QUOTATION:
      if (req.query.startDate && req.query.endDate) {
        filter.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        };
      }
      break;
    default:
      break;
  }
  const total = await model.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  return { filter, page, limit, skip, total, totalPages };
};
