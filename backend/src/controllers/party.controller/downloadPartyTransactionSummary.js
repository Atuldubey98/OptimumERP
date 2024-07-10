const { default: mongoose } = require("mongoose");
const { PartyNotFound } = require("../../errors/party.error");
const Invoice = require("../../models/invoice.model");
const Party = require("../../models/party.model");
const Purchase = require("../../models/purchase.model");
const Transaction = require("../../models/transaction.model");
const xl = require("excel4node");

const downloadPartyTransactionSummary = async (req, res) => {
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
};

module.exports = downloadPartyTransactionSummary;
