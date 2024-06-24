const { isValidObjectId } = require("mongoose");
const { purchaseDto } = require("../dto/purchase.dto");
const { PurchaseNotFound } = require("../errors/purchase.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Purchase = require("../models/purchase.model");
const path = require("path");
const Joi = require("joi");
const OrgModel = require("../models/org.model");
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
const logger = require("../logger");
const {
  saveBill,
  deleteBill,
  getBillDetail,
} = require("../helpers/bill.helper");
const {
  renderHtml,
  sendHtmlToPdfResponse,
} = require("../helpers/render_engine.helper");

exports.createPurchase = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const purchase = await saveBill({
    Bill: Purchase,
    dto: purchaseDto,
    NotFound: PurchaseNotFound,
    requestBody,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchases": 1 } }
  );
  logger.info(`Invoice created ${purchase.id}`);
  return res.status(201).json({ data: purchase, message: "Purchase created" });
});

exports.updatePurchase = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  await saveBill({
    Bill: Purchase,
    dto: purchaseDto,
    NotFound: PurchaseNotFound,
    requestBody,
    billId: req.params.purchaseId,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchases": 1 } }
  );
  return res.status(200).json({ message: "Purchase updated !" });
});

exports.deletePurchase = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();
  await deleteBill({
    Bill: Purchase,
    filter: {
      _id: purchaseId,
      org: req.params.orgId,
    },
    NotFound: PurchaseNotFound,
  });
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
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "purchases",
    }),
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

exports.viewPurchaseBill = async (req, res) => {
  try {
    const purchaseId = req.params.purchaseId;
    if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();
    const filter = {
      _id: purchaseId,
      org: req.params.orgId,
    };
    const template = req.query.template || "simple";
    const locationTemplate = `templates/${template}`;
    const data = await getBillDetail({
      Bill: Purchase,
      filter,
      NotFound: PurchaseNotFound,
    });
    return res.render(locationTemplate, data);
  } catch (error) {
    return res.render(`templates/error`);
  }
};

exports.downloadPurchaseInvoice = requestAsyncHandler(async (req, res) => {
  const purchaseId = req.params.purchaseId;
  if (!isValidObjectId(purchaseId)) throw new PurchaseNotFound();
  const template = req.query.template || "simple";
  const data = await getBillDetail({
    Bill: Purchase,
    filter: {
      _id: purchaseId,
      org: req.params.orgId,
    },
    NotFound: PurchaseNotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `Purchase-${data.num}-${data.date}.pdf`,
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
