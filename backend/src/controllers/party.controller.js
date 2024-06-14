const { createPartyDto, updatePartyDto } = require("../dto/party.dto");
const { PartyNotFound, PartyNotDelete } = require("../errors/party.error");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const logger = require("../logger");
const mongoose = require("mongoose");
const Purchase = require("../models/purchase.model");
const Contact = require("../models/contacts.model");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
const xl = require("excel4node");

exports.createParty = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const body = await createPartyDto.validateAsync({
    ...req.body,
    org: orgId,
  });
  const party = new Party(body);
  await party.save();
  await OrgModel.updateOne(
    { _id: orgId },
    { $inc: { "relatedDocsCount.parties": 1 } }
  );
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
  const { skip, limit, total, totalPages, filter, page } =
    await getPaginationParams({
      req,
      model: Party,
      modelName: entitiesConfig.PARTIES,
    });

  const parties = await Party.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name active")
    .populate("updatedBy", "name active");

  return res.status(200).json({
    page,
    limit,
    totalPages,
    total,
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
  const contact = await Contact.findOne({
    org: req.params.orgId,
    party: req.params.partyId,
  });
  if (contact) throw new PartyNotDelete({ reason: "contact is linked" });
  const party = await Party.findOneAndDelete({
    _id: req.params.partyId,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.parties": -1 } }
  );
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
});

exports.downloadPartyTransactions = requestAsyncHandler(async (req, res) => {
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

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc", "num description")
    .exec();
  const entities = [Invoice, Purchase];

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
  const transactionReportFields = {
    header: {
      type: "Type",
      amount: "Grand Total",
      totalTax: "Total Tax",
      relatedTo: "Related To",
      createdAt: "Done at",
      num: "Num",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      num: item.doc?.num || item.doc?.purchaseNo || "",
      type: item?.docModel,
      relatedTo: item?.doc?.party?.name || item.doc?.description || "",
      totalTax: (item.totalTax || 0).toFixed(2),
      amount: (item.total + item.totalTax).toFixed(2),
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    }),
  };
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet();
  const headerStyle = wb.createStyle({
    font: {
      bold: true,
    },
    border: {
      outline: true,
    },
  });
  const reportTransactions = transactions.map(
    transactionReportFields.bodyMapper
  );
  ws.cell(1, 1).string("Party Name").style(headerStyle);
  ws.cell(1, 2).string(party.name);
  ws.cell(2, 1).string("Party Billing Address").style(headerStyle);
  ws.cell(2, 2).string(party.billingAddress);
  Object.values(transactionReportFields.header).forEach((value, index) => {
    const col = index + 1;
    ws.cell(3, col).string(value).style(headerStyle);
  });
  reportTransactions.forEach((reportItem, index) => {
    Object.entries(transactionReportFields.header).forEach(
      ([key], fieldIndex) => {
        const row = index + 4;
        const col = fieldIndex + 1;
        if (key != "_id") {
          ws.cell(row, col).string(reportItem[key]);
        }
      }
    );
  });
  ws.cell(reportTransactions.length + 4, 1)
    .string("Total Sale")
    .style(headerStyle);
  ws.cell(reportTransactions.length + 4, 2).number(invoiceBalance.total);

  ws.cell(reportTransactions.length + 5, 1)
    .string("Total Purchase")
    .style(headerStyle);
  ws.cell(reportTransactions.length + 5, 2).number(purchaseBalance.total);

  ws.cell(reportTransactions.length + 6, 1)
    .string("Period")
    .style(headerStyle);
  ws.cell(reportTransactions.length + 6, 2).string(
    `${req.query.startDate} - ${req.query.endDate}`
  );

  const excelBuffer = await wb.writeToBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Transaction-${Date.now()}.xlsx`
  );
  res.setHeader("Content-Length", excelBuffer.length);
  return res.send(excelBuffer);
});
