const { isValidObjectId } = require("mongoose");
const { purchaseDto } = require("../dto/purchase.dto");
const { PartyNotFound } = require("../errors/party.error");
const {
  PurchaseNotFound,
  PurchaseDuplicate,
} = require("../errors/purchase.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const Purchase = require("../models/purchase.model");
const { getTotalAndTax } = require("./quotes.controller");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const currencies = require("../constants/currencies");
const path = require("path");
const Joi = require("joi");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
exports.createPurchase = requestAsyncHandler(async (req, res) => {
  const body = await purchaseDto.validateAsync(req.body);
  const { total, totalTax, sgst, cgst, igst } = getTotalAndTax(body.items);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const party = await Party.findOne({
    _id: body.party,
    org: req.params.orgId,
  });
  if (!party) throw new PartyNotFound();
  const existingInvoice = await Purchase.findOne({
    org: req.params.orgId,
    num: body.num,
    financialYear: setting.financialYear,
    party: body.party,
  });
  if (existingInvoice) throw new PurchaseDuplicate(body.num);
  const newPurchase = new Purchase({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
    createdBy: req.body.createdBy,
    financialYear: setting.financialYear,
    sgst,
    cgst,
    igst,
  });
  await newPurchase.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "purchase",
    financialYear: setting.financialYear,
    doc: newPurchase._id,
    total,
    date: newPurchase.date,
    totalTax,
    party: body.party,
  });
  await transaction.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchases": 1 } }
  );
  return res
    .status(201)
    .json({ message: "Purchase created !", data: newPurchase });
});

exports.updatePurchase = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, sgst, cgst, igst } = getTotalAndTax(req.body.items);
  const body = await purchaseDto.validateAsync(req.body);
  const updatedInvoice = await Purchase.findOneAndUpdate(
    { _id: req.params.purchaseId, org: req.params.orgId },
    {
      ...body,
      total,
      totalTax,
      sgst,
      igst,
      cgst,
    }
  );

  const updateTransaction = await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "purchase",
      doc: updatedInvoice.id,
    },
    {
      updatedBy: req.body.updatedBy,
      total,
      totalTax,
      party: body.party,
      date: updatedInvoice.date,
    }
  );
  if (!updatedInvoice || !updateTransaction) throw new PurchaseNotFound();
  return res.status(200).json({ message: "Purchase updated !" });
});

exports.deletePurchase = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();
  const purchase = await Purchase.findOneAndDelete({
    _id: purchaseId,
    org: req.params.orgId,
  });
  const transaction = await Transaction.findOneAndDelete({
    org: req.params.orgId,
    docModel: "purchase",
    doc: purchaseId,
  });
  if (!transaction) throw new PurchaseNotFound();
  if (!purchase) throw new PurchaseNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchases": -1 } }
  );
  return res.status(200).json({ message: "Purchase deleted !" });
});

exports.getPurchases = requestAsyncHandler(async (req, res) => {
  const { skip, limit, filter, page, total, totalPages } =
    await getPaginationParams({
      req,
      model: Purchase,
      modelName: entitiesConfig.PURCHASE_INVOICES,
    });
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  return res.status(200).json({
    data: purchases,
    page,
    limit,
    totalPages,
    total,
    message: "Purchases retrieved successfully",
  });
});

exports.getPurchase = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.purchaseId)) throw new PurchaseNotFound();
  const purchase = await Purchase.findOne({
    _id: req.params.purchaseId,
    org: req.params.orgId,
  })
    .populate("party", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
  if (!purchase) throw new PurchaseNotFound();
  return res.status(200).json({ data: purchase });
});

exports.viewPurchaseBill = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo");
  const grandTotal = purchase.items.reduce(
    (total, purchaseItem) =>
      total +
      (purchaseItem.price *
        purchaseItem.quantity *
        (100 +
          (purchaseItem.gst === "none"
            ? 0
            : parseFloat(purchaseItem.gst.split(":")[1])))) /
        100,
    0
  );
  const templateName = req.query.template || "simple";
  const locationTemplate = `templates/${templateName}`;
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;

  const items = purchase.items.map(
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
  const data = {
    entity: purchase,
    num: purchase.num,
    grandTotal,
    items,
    bank: null,
    upiQr: null,
    grandTotal: `${currencySymbol} ${grandTotal}`,
    total: `${currencySymbol} ${purchase.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${purchase.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${purchase.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${purchase.igst.toFixed(2)}`,
    title: "Purchase",
    billMetaHeading: "Purchase Information",
    partyMetaHeading: "Bill From",
  };
  return res.render(locationTemplate, data);
});

exports.downloadPurchaseInvoice = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo");
  const grandTotal = purchase.items.reduce(
    (total, purchaseItem) =>
      total +
      (purchaseItem.price *
        purchaseItem.quantity *
        (100 +
          (purchaseItem.gst === "none"
            ? 0
            : parseFloat(purchaseItem.gst.split(":")[1])))) /
        100,
    0
  );
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  const currencySymbol = currencies[setting.currency].symbol;

  const items = purchase.items.map(
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
  const data = {
    entity: purchase,
    num: purchase.num,
    grandTotal,
    bank: null,
    upiQr: null,
    items,
    grandTotal: `${currencySymbol} ${grandTotal}`,
    total: `${currencySymbol} ${purchase.total}`,
    sgst: `${currencySymbol} ${purchase.sgst}`,
    cgst: `${currencySymbol} ${purchase.cgst}`,
    igst: `${currencySymbol} ${purchase.igst}`,
    title: "Purchase",
    billMetaHeading: "Purchase Information",
    partyMetaHeading: "Bill From",
  };
  const templateName = req.query.template || "simple";
  const locationTemplate = path.join(
    __dirname,
    `../views/templates/${templateName}/index.ejs`
  );
  ejs.renderFile(locationTemplate, data, (err, html) => {
    if (err) throw err;
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-disposition": `attachment;filename=purchase - ${purchase.date}.pdf`,
    });
    wkhtmltopdf(html, {
      enableLocalFileAccess: true,
      pageSize: "A4",
    }).pipe(res);
  });
});
const paymentDto = Joi.object({
  description: Joi.string().allow("").required().label("Description"),
  amount: Joi.number().required().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().required().label("Date"),
});
exports.payoutPurchase = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();
  const body = await paymentDto.validateAsync(req.body);
  const purchase = await Purchase.findOne({
    _id: purchaseId,
    org: req.params.orgId,
  });
  const grandTotal = purchase.total + purchase.totalTax;
  purchase.status = grandTotal > body.amount ? "unpaid" : "paid";
  purchase.updatedBy = req.session.user._id;
  purchase.payment = body;
  await purchase.save();
  if (!purchase) throw new PurchaseNotFound();
  return res.status(201).json({ message: "Payment added" });
});
