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
const { isValidObjectId, default: mongoose } = require("mongoose");

exports.executeMongoDbTransaction = async (operationsCallback) => {
  const session = await mongoose.startSession();
  return session.withTransaction(async () => {
    return await operationsCallback(session);
  }).finally(() => {
    session.endSession();
  });
}
exports.getPaginationParams = async ({
  query,
  modelName,
  params,
  model,
  shouldPaginate = true,
}) => {
  const page = parseInt(query?.page) || 1;
  const limit = parseInt(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {
    org: params?.orgId,
  };
  if (query.search) filter.$text = { $search: query?.search };
  switch (modelName) {
    case CONTACTS:
      if (query.type) filter.type = query.type;
      if (isValidObjectId(query.party)) filter.party = query.party;
      break;
    case EXPENSES:
    case PRODUCTS:
      if (query.category) filter.category = query.category;
      break;
    case TRANSACTIONS:
      if (query.type) filter.docModel = query.type;
    case INVOICES:
    case PROFORMA_INVOICES:
    case QUOTATION:
    case PURCHASE_INVOICES:
    case PURCHASE_ORDERS:
      if (query.startDate && query.endDate)
        filter.date = {
          $gte: new Date(query.startDate),
          $lte: new Date(query.endDate),
        };
      break;
    default:
      break;
  }
  const total = shouldPaginate ? await model.countDocuments(filter) : 0;
  const totalPages = Math.ceil(total / limit);
  return { filter, page, limit, skip, total, totalPages };
};

exports.hasUserReachedCreationLimits = ({
  relatedDocsCount,
  userLimits,
  key,
}) => {
  const currentOrgDocsCount = relatedDocsCount[key];
  const userPlanLimit = userLimits[key] || 0;
  return userPlanLimit && currentOrgDocsCount >= userPlanLimit;
};
