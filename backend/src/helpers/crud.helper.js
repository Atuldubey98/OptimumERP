const {
  CONTACTS,
  EXPENSES,
  INVOICES,
  PRODUCTS,
  PROFORMA_INVOICES,
  PURCHASE_INVOICES,
  PURCHASE_ORDERS,
  QUOTATION,
  TRANSACTIONS,
} = require("../constants/entities");
const { isValidObjectId } = require("mongoose");

exports.getPaginationParams = async ({
  req,
  modelName,
  model,
  shouldPaginate = true,
}) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {
    org: req.params.orgId,
  };
  if (req.query.search) filter.$text = { $search: req.query.search };
  switch (modelName) {
    case CONTACTS:
      if (req.query.type) filter.type = req.query.type;
      if (isValidObjectId(req.query.party)) filter.party = req.query.party;
      break;
    case EXPENSES:
    case PRODUCTS:
      if (req.query.category) filter.category = req.query.category;
      break;
    case TRANSACTIONS:
      if (req.query.type) filter.docModel = req.query.type;
    case INVOICES:
    case PROFORMA_INVOICES:
    case QUOTATION:
    case PURCHASE_INVOICES:
    case PURCHASE_ORDERS:
      if (req.query.startDate && req.query.endDate)
        filter.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        };
      break;
    default:
      break;
  }
  const total = shouldPaginate ? await model.countDocuments(filter) : 0;
  const totalPages = Math.ceil(total / limit);
  return { filter, page, limit, skip, total, totalPages };
};
