const { isValidObjectId } = require("mongoose");
const { purchaseDto } = require("../dto/purchase.dto");
const { CustomerNotFound } = require("../errors/customer.error");
const {
  PurchaseNotFound,
  PurchaseDuplicate,
} = require("../errors/purchase.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Customer = require("../models/customer.model");
const Purchase = require("../models/purchase.model");
const { getTotalAndTax } = require("./quotes.controller");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");

exports.createPurchase = requestAsyncHandler(async (req, res) => {
  const body = await purchaseDto.validateAsync(req.body);
  const { total, totalTax, sgst, cgst, igst } = getTotalAndTax(body.items);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const customer = await Customer.findOne({
    _id: body.customer,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  const existingInvoice = await Purchase.findOne({
    org: req.params.orgId,
    purchaseNo: body.purchaseNo,
    financialYear: setting.financialYear,
    customer: body.customer,
  });
  if (existingInvoice) throw new PurchaseDuplicate(body.purchaseNo);
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
    totalTax,
    customer: body.customer,
  });
  await transaction.save();
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
    { updatedBy: req.body.updatedBy, total, totalTax, customer: body.customer }
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
  return res.status(200).json({ message: "Purchase deleted !" });
});

exports.getPurchases = requestAsyncHandler(async (req, res) => {
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
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Purchase.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
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
    .populate("customer", "name _id")
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
    .populate("customer", "name gstNo panNo")
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
  const data = {
    entity: purchase,
    num: purchase.purchaseNo,
    grandTotal,
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
    .populate("customer", "name gstNo panNo")
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
  const data = {
    entity: purchase,
    num: purchase.purchaseNo,
    grandTotal,
    title: "Purchase",
    billMetaHeading: "Purchase Information",
    partyMetaHeading: "Bill From",
  };
  const templateName = req.query.template || "simple";
  const locationTemplate = `./src/views/templates/${templateName}/index.ejs`;
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
