const entitiesConfig = require("../constants/entities");
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
    case entitiesConfig.CONTACTS:
      if (req.query.type) filter.type = req.query.type;
      if (isValidObjectId(req.query.party)) filter.party = req.query.party;
      break;

    case entitiesConfig.EXPENSES:
    case entitiesConfig.PRODUCTS:
      if (req.query.category) filter.category = req.query.category;
      break;

    case entitiesConfig.INVOICES:
    case entitiesConfig.PROFORMA_INVOICES:
    case entitiesConfig.QUOTATION:
    case entitiesConfig.PURCHASE_INVOICES:
    case entitiesConfig.PURCHASE_ORDERS:
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
