const { default: mongoose } = require("mongoose");
const { PartyNotFound } = require("../../errors/party.error");
const Invoice = require("../../models/invoice.model");
const Party = require("../../models/party.model");
const Purchase = require("../../models/purchase.model");
const Transaction = require("../../models/transaction.model");

const getTransactionSummary = async (req, res) => {
  if (!req.params.partyId) throw PartyNotFound();
  const filter = {
    org: req.params.orgId,
    party: req.params.partyId,
  };
  const search = req.query.search;
  const party = await Party.findOne({
    org: req.params.orgId,
    _id: req.params.partyId,
  }).exec();
  const transactionTypes = req.query.transactionTypes;
  if (transactionTypes && typeof transactionTypes === "string")
    filter.docModel = { $in: transactionTypes.split(",") };
  if (search) filter.$text = { $search: search };

  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .populate("party", "name billingAddress")
    .skip(skip)
    .limit(limit)
    .exec();
  const entities = [Invoice, Purchase];
  const [invoicesByStatus, purchasesByStatus] = await Promise.all(
    entities.map((model) =>
      model.aggregate([
        {
          $match: {
            org: new mongoose.Types.ObjectId(req.params.orgId),
            party: new mongoose.Types.ObjectId(req.params.partyId),
            date: filter.date,
          },
        },
        {
          $group: {
            _id: "$status",
            total: { $sum: { $sum: ["$total", "$totalTax"] } },
            count: { $sum: 1 },
          },
        },
      ])
    )
  );
  const [invoiceBalanceCalculator, purchaseBalanceCalculator] =
    await Promise.all(
      entities.map((model) =>
        model.aggregate([
          {
            $match: {
              org: new mongoose.Types.ObjectId(req.params.orgId),
              party: new mongoose.Types.ObjectId(req.params.partyId),
              date: filter.date,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $sum: ["$total", "$totalTax"] } },
              payment: { $sum: "$payment.amount" },
            },
          },
        ])
      )
    );
  const invoiceBalance = invoiceBalanceCalculator.length
    ? invoiceBalanceCalculator[0]
    : { total: 0, payment: 0 };
  const purchaseBalance = purchaseBalanceCalculator.length
    ? purchaseBalanceCalculator[0]
    : { total: 0, payment: 0 };

  const total = await Transaction.countDocuments(filter).exec();
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: transactions,
    invoiceBalance,
    page,
    limit,
    totalPages,
    party,
    purchasesByStatus,
    purchaseBalance,
    invoicesByStatus,
    total,
    message: "Transactions retrieved successfully",
  });
};

module.exports = getTransactionSummary;