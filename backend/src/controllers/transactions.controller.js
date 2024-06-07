const { TRANSACTIONS } = require("../constants/entities");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const { getPaginationParams } = require("../helpers/crud.helper");
const Transaction = require("../models/transaction.model");

exports.getTransactions = requestAsyncHandler(async (req, res) => {
  const { filter, limit, page, total, totalPages, skip } =
    await getPaginationParams({
      req,
      model: Transaction,
      modelName: TRANSACTIONS,
    });
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .populate("party", "name")
    .skip(skip)
    .limit(limit)
    .exec();
  const response = {
    data: transactions,
    page,
    limit,
    totalPages,
    total,
    message: "Transactions retrieved successfully",
  };
  return res.status(200).json(response);
});
