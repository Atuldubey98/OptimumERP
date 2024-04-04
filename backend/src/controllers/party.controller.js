const { createPartyDto, updatePartyDto } = require("../dto/party.dto");
const { PartyNotFound, PartyNotDelete } = require("../errors/party.error");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const Invoice = require("../models/invoice.model");
const Quotation = require("../models/quotes.model");
const Transaction = require("../models/transaction.model");
const logger = require("../logger");
const { default: mongoose } = require("mongoose");
const Purchase = require("../models/purchase.model");
const Contact = require("../models/contacts.model");
exports.createParty = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const body = await createPartyDto.validateAsync({
    ...req.body,
    org: orgId,
  });
  const party = new Party(body);
  await party.save();
  logger.info(`created party ${party.id}`);
  return res.status(201).json({ message: "Party created !" });
});

exports.updateParty = requestAsyncHandler(async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const body = await updatePartyDto.validateAsync(req.body);
  const updatedParty = await Party.findOneAndUpdate(
    { _id: req.params.partyId, org: req.params.orgId },
    body
  );
  if (!updatedParty) throw new PartyNotFound();
  return res.status(200).json({ message: "Party updated !" });
});

exports.getParty = requestAsyncHandler(async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const party = await Party.findOne({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  return res.status(200).json({ data: party });
});

exports.getAllParty = requestAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };

  const totalPartys = await Party.countDocuments(filter);
  const totalPages = Math.ceil(totalPartys / limit);

  const skip = (page - 1) * limit;

  const parties = await Party.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    page,
    limit,
    totalPages,
    total: totalPartys,
    data: parties,
  });
});

exports.deleteParty = requestAsyncHandler(async (req, res) => {
  if (!req.params.partyId) throw new PartyNotFound();
  const transaction = await Transaction.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (transaction)
    throw new PartyNotDelete({ reason: `${transaction.docModel} is linked` });
  const contact = new Contact.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (contact) throw new PartyNotDelete({ reason: "contact is linked" });
  const party = await Party.findOneAndDelete({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  return res.status(200).json({ message: "Party deleted" });
});

exports.searchParty = requestAsyncHandler(async (req, res) => {
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.keyword || "";
  if (search) filter.$text = { $search: search };
  const parties = await Party.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ data: parties });
});

exports.getInvoicesForParty = requestAsyncHandler(async (req, res) => {
  if (!req.params.partyId) throw PartyNotFound();
  const filter = {
    org: req.params.orgId,
    party: req.params.partyId,
  };
  const search = req.query.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (req.query.startDate && req.query.endDate) {
    filter.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: invoices,
    page,
    limit,
    totalPages,
    total,
    message: "Invoices retrieved successfully",
  });
});

exports.getPartyTransactions = requestAsyncHandler(async (req, res) => {
  if (!req.params.partyId) throw PartyNotFound();
  const filter = {
    org: req.params.orgId,
    party: req.params.partyId,
  };
  const search = req.query.search;
  const party = await Party.findOne({
    org: req.params.orgId,
    _id: req.params.partyId,
  });
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

  const invoicesByStatus = await Invoice.aggregate([
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
  ]);
  const purchasesByStatus = await Purchase.aggregate([
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
  ]);
  const balanceCalculator = await Invoice.aggregate([
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
        amountReceived: { $sum: "$payment.amount" },
      },
    },
  ]);
  const invoiceBalance = balanceCalculator.length
    ? balanceCalculator[0]
    : { total: 0, amountReceived: 0 };

  const total = await Transaction.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: transactions,
    invoiceBalance,
    page,
    limit,
    totalPages,
    party,
    purchasesByStatus,
    invoicesByStatus,
    total,
    message: "Transactions retrieved successfully",
  });
});
