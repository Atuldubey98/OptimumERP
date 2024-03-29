const { purchaseOrderDto } = require("../dto/purchase_order.dto");
const { OrgNotFound } = require("../errors/org.error");
const { PartyNotFound } = require("../errors/party.error");
const { PurchaseNotFound } = require("../errors/purchase.error");
const { PurchaseOrderDuplicate } = require("../errors/purchase_order.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const PurchaseOrder = require("../models/purchase_order.model");
const Setting = require("../models/settings.model");
const { getTotalAndTax } = require("./quotes.controller");

exports.createPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const body = await purchaseOrderDto.validateAsync(req.body);
  const { total, totalTax, cgst, sgst, igst } = getTotalAndTax(body.items);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const party = await Party.findOne({
    _id: body.party,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  const existingPo = await PurchaseOrder.findOne({
    org: req.params.orgId,
    quoteNo: body.poNo,
    financialYear: setting.financialYear,
  });
  if (existingPo) throw new PurchaseOrderDuplicate(body.poNo);
  const transactionPrefix = setting.transactionPrefix.purchaseOrder || "";
  const purchaseOrder = new PurchaseOrder({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
    num: transactionPrefix + body.poNo,
    financialYear: setting.financialYear,
    sgst,
    cgst,
    igst,
  });
  await purchaseOrder.save();
  return res
    .status(201)
    .json({ message: "Purchase order created !", data: purchaseOrder });
});

exports.getPurchaseOrders = requestAsyncHandler(async (req, res) => {
  const filter = {
    org: req.params.orgId,
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
  const pos = await PurchaseOrder.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await PurchaseOrder.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: pos,
    page,
    limit,
    totalPages,
    total,
    message: "POS retrieved successfully",
  });
});

exports.deletePurchaseOrder = requestAsyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });
  if (!po) throw new PurchaseNotFound();
  return res.status(200).json({ message: "Purchase order deleted" });
});

exports.updatePurchaseOrder = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, cgst, sgst, igst } = getTotalAndTax(req.body.items);
  const body = await purchaseOrderDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  }).select("transactionPrefix");
  if (!setting) throw new OrgNotFound();
  const updatedPo = await PurchaseOrder.findOneAndUpdate(
    { _id: req.params.id, org: req.params.orgId },
    {
      ...body,
      total,
      num: setting.transactionPrefix.purchaseOrder + body.poNo,
      totalTax,
      sgst,
      cgst,
      igst,
    }
  );
  if (!updatedPo) throw new PurchaseNotFound();
  return res.status(200).json({ message: "Purchase order updated" });
});

exports.getNextPurchaseOrderNumber = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId });
  const po = await PurchaseOrder.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { invoiceNo: 1 },
    { sort: { invoiceNo: -1 } }
  ).select("invoiceNo");
  return res.status(200).json({ data: po ? po.poNo + 1 : 1 });
});
