const { isValidObjectId } = require("mongoose");
const { purchaseOrderDto } = require("../dto/purchase_order.dto");
const { OrgNotFound } = require("../errors/org.error");
const { PartyNotFound } = require("../errors/party.error");
const { PurchaseNotFound } = require("../errors/purchase.error");
const {
  PurchaseOrderDuplicate,
  PurchaseOrderNotFound,
} = require("../errors/purchase_order.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const OrgModel = require("../models/org.model");
const Party = require("../models/party.model");
const PurchaseOrder = require("../models/purchase_order.model");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const { getTotalAndTax } = require("./quotes.controller");
const { ToWords } = require("to-words");
const currencies = require("../constants/currencies");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const wkhtmltopdf = require("wkhtmltopdf");
const ejs = require("ejs");
const path = require("path");

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
    poNo: body.poNo,
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
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": 1 } }
  );
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "purchase_order",
    financialYear: setting.financialYear,
    doc: purchaseOrder._id,
    total,
    totalTax,
    party: body.party,
    date: purchaseOrder.date,
  });
  await transaction.save();
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

  const total = await PurchaseOrder.countDocuments(filter).exec();

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
  const po = await PurchaseOrder.findOneAndDelete({
    org: req.params.orgId,
    _id: req.params.id,
  }).exec();
  if (!po) throw new PurchaseNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": -1 } }
  ).exec();
  await Transaction.findOneAndDelete({
    docModel: "purchase_order",
    org: req.params.orgId,
    doc: req.params.id,
  }).exec();
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
  if (!updatedPo) throw new PurchaseOrderNotFound();
  const updateTransaction = await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "purchase_order",
      doc: updatedPo.id,
    },
    {
      updatedBy: req.body.updatedBy,
      total,
      totalTax,
      party: body.party,
      num: setting.transactionPrefix.purchaseOrder + body.poNo,
      date: updatedPo.date,
    }
  );
  if (!updateTransaction) throw new PurchaseOrderNotFound();

  return res.status(200).json({ message: "Purchase order updated" });
});

exports.getNextPurchaseOrderNumber = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId }).exec();
  const po = await PurchaseOrder.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { poNo: 1 },
    { sort: { poNo: -1 } }
  )
    .select("poNo")
    .exec();
  return res.status(200).json({ data: po ? po.poNo + 1 : 1 });
});

exports.getPurchaseOrder = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new PurchaseOrderNotFound();
  const po = await PurchaseOrder.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email ")
    .populate("updatedBy", "name email")
    .populate("org", "name address ");
  if (!po) throw new PurchaseOrderNotFound();
  return res.status(200).json({ data: po });
});

exports.viewPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseOrderNotFound();
  const templateName = req.query.template || "simple";
  const locationTemplate = `templates/${templateName}`;
  const purchaseOrder = await PurchaseOrder.findOne({
    _id: id,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  if (!purchaseOrder) throw new PurchaseOrderNotFound();
  const grandTotal = (purchaseOrder.items || []).reduce(
    (total, invoiceItem) =>
      total +
      (invoiceItem.price *
        invoiceItem.quantity *
        (100 +
          (invoiceItem.gst === "none"
            ? 0
            : parseFloat(invoiceItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;
  const items = purchaseOrder.items.map(
    ({ name, price, quantity, gst, um, code }) => ({
      name,
      quantity,
      code,
      gst: taxRates.find((taxRate) => taxRate.value === gst)?.label,
      um: ums.find((unit) => unit.value === um)?.label,
      price: `${currencySymbol} ${price.toFixed(2)}`,
      total: `${currencySymbol} ${(
        price *
        quantity *
        ((100 + (gst === "none" ? 0 : parseFloat(gst.split(":")[1]))) / 100)
      ).toFixed(2)}`,
    })
  );
  const toWords = new ToWords({
    localeCode: setting.localeCode || "en-IN",
    converterOptions: {
      ignoreDecimal: true,
    },
  });
  return res.render(locationTemplate, {
    entity: purchaseOrder,
    num: purchaseOrder.num,
    items,
    bank: null,
    grandTotalInWords: toWords.convert(grandTotal, { currency: true }),
    upiQr: null,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    total: `${currencySymbol} ${purchaseOrder.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${purchaseOrder.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${purchaseOrder.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${purchaseOrder.igst.toFixed(2)}`,
    title: "Purchase Order",
    billMetaHeading: "Purchase Order information",
    partyMetaHeading: "Order To",
  });
});

exports.downloadPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseOrderNotFound();
  const templateName = req.query.template || "simple";
  const locationTemplate = path.join(
    __dirname,
    `../views/templates/${templateName}/index.ejs`
  );
  const purchaseOrder = await PurchaseOrder.findOne({
    _id: id,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  if (!purchaseOrder) throw new PurchaseOrderNotFound();
  const grandTotal = (purchaseOrder.items || []).reduce(
    (total, invoiceItem) =>
      total +
      (invoiceItem.price *
        invoiceItem.quantity *
        (100 +
          (invoiceItem.gst === "none"
            ? 0
            : parseFloat(invoiceItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;
  const items = purchaseOrder.items.map(
    ({ name, price, quantity, gst, um, code }) => ({
      name,
      quantity,
      code,
      gst: taxRates.find((taxRate) => taxRate.value === gst).label,
      um: ums.find((unit) => unit.value === um).label,
      price: `${currencySymbol} ${price.toFixed(2)}`,
      total: `${currencySymbol} ${(
        price *
        quantity *
        ((100 + (gst === "none" ? 0 : parseFloat(gst.split(":")[1]))) / 100)
      ).toFixed(2)}`,
    })
  );
  const toWords = new ToWords({
    localeCode: setting.localeCode || "en-IN",
    converterOptions: {
      ignoreDecimal: true,
    },
  });
  ejs.renderFile(
    locationTemplate,
    {
      entity: purchaseOrder,
      num: purchaseOrder.num,
      items,
      upiQr: null,
      bank: null,
      grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
      grandTotalInWords: toWords.convert(grandTotal, { currency: true }),
      total: `${currencySymbol} ${purchaseOrder.total.toFixed(2)}`,
      sgst: `${currencySymbol} ${purchaseOrder.sgst.toFixed(2)}`,
      cgst: `${currencySymbol} ${purchaseOrder.cgst.toFixed(2)}`,
      igst: `${currencySymbol} ${purchaseOrder.igst.toFixed(2)}`,
      title: "Purchase Order",
      billMetaHeading: "Purchase Order information",
      partyMetaHeading: "Order To",
    },
    (err, html) => {
      if (err) throw err;
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-disposition": `attachment;filename=invoice - ${purchaseOrder.date}.pdf`,
      });
      wkhtmltopdf(html, {
        enableLocalFileAccess: true,
        pageSize: "A4",
      }).pipe(res);
    }
  );
});
