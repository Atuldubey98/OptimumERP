const { isValidObjectId } = require("mongoose");
const { saleOrderDto } = require("../dto/sale_order.dto");
const { OrgNotFound } = require("../errors/org.error");
const { PartyNotFound } = require("../errors/party.error");
const {
  SaleOrderDuplicate,
  SaleOrderNotFound,
} = require("../errors/sale_order.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const logger = require("../logger");
const OrgModel = require("../models/org.model");
const Party = require("../models/party.model");
const SaleOrder = require("../models/sale_order.model");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const { getTotalAndTax } = require("./quotes.controller");

exports.createSaleOrder = requestAsyncHandler(async (req, res) => {
  const body = await saleOrderDto.validateAsync(req.body);
  const { total, totalTax, igst, sgst, cgst } = getTotalAndTax(body.items);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const party = await Party.findOne({
    _id: body.party,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  const existingSaleOrder = await SaleOrder.findOne({
    org: req.params.orgId,
    soNo: body.soNo,
    financialYear: setting.financialYear,
  });
  if (existingSaleOrder) throw new SaleOrderDuplicate(existingSaleOrder.num);
  const saleOrderPrefix = setting.transactionPrefix.saleOrder || "";
  const newSaleOrder = new SaleOrder({
    org: req.params.orgId,
    ...body,
    total,
    num: saleOrderPrefix + body.soNo,
    totalTax,
    igst,
    sgst,
    cgst,
    financialYear: setting.financialYear,
  });
  await newSaleOrder.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "sale_order",
    financialYear: setting.financialYear,
    doc: newSaleOrder._id,
    total,
    totalTax,
    party: body.party,
    date: newSaleOrder.date,
  });
  await transaction.save();
  logger.info(`Sale order created ${newSaleOrder.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.saleOrders": 1 } }
  );
  return res
    .status(201)
    .json({ message: "Sale order created !", data: newSaleOrder });
});

exports.getSaleOrders = requestAsyncHandler(async (req, res) => {
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
  const saleOrders = await SaleOrder.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await SaleOrder.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    data: saleOrders,
    page,
    limit,
    totalPages,
    total,
  });
});

exports.getSaleOrder = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new SaleOrderNotFound();
  const saleOrder = await SaleOrder.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email ")
    .populate("updatedBy", "name email")
    .populate("org", "name address ");
  if (!saleOrder) throw new SaleOrderNotFound();
  return res.status(200).json({ data: saleOrder });
});

exports.getNextSaleOrderNumber = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId });
  const saleOrder = await SaleOrder.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { soNo: 1 },
    { sort: { soNo: -1 } }
  ).select("soNo");
  return res.status(200).json({ data: saleOrder ? saleOrder.soNo + 1 : 1 });
});
