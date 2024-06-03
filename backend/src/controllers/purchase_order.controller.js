const { isValidObjectId } = require("mongoose");
const { purchaseOrderDto } = require("../dto/purchase_order.dto");
const { PurchaseOrderNotFound } = require("../errors/purchase_order.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const {
  saveBill,
  deleteBill,
  getNextSequence,
  getBillDetail,
} = require("../helpers/bill.helper");
const logger = require("../logger");
const OrgModel = require("../models/org.model");
const PurchaseOrder = require("../models/purchase_order.model");
const {
  renderHtml,
  sendHtmlToPdfResponse,
} = require("../helpers/render_engine.helper");

exports.createPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const purchase = await saveBill({
    Bill: PurchaseOrder,
    dto: purchaseOrderDto,
    NotFound: PurchaseOrderNotFound,
    requestBody,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": 1 } }
  );
  logger.info(`Purchase Invoice created ${purchase.id}`);
  return res.status(201).json({ data: purchase, message: "Purchase created" });
});

exports.getPurchaseOrders = requestAsyncHandler(async (req, res) => {});

exports.deletePurchaseOrder = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseOrderNotFound();
  await deleteBill({
    Bill: PurchaseOrder,
    filter: {
      _id: id,
      org: req.params.orgId,
    },
    NotFound: PurchaseOrderNotFound,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": -1 } }
  );
  return res
    .status(201)
    .json({ data: purchase, message: "Purchase order deleted" });
});

exports.updatePurchaseOrder = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  await saveBill({
    Bill: PurchaseOrder,
    dto: purchaseOrderDto,
    NotFound: PurchaseOrderNotFound,
    requestBody,
    billId: req.params.id,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": 1 } }
  );
});

exports.getNextPurchaseOrderNumber = requestAsyncHandler(async (req, res) => {
  const nextSequence = await getNextSequence({
    org: req.params.orgId,
    Bill: PurchaseOrder,
  });
  return res.status(200).json({ data: nextSequence });
});

exports.viewPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseOrderNotFound();
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const template = req.query.template || "simple";
  const locationTemplate = `templates/${template}`;
  const data = await getBillDetail({
    Bill: PurchaseOrder,
    filter,
    NotFound: PurchaseOrderNotFound,
  });
  return res.render(locationTemplate, data);
});

exports.downloadPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseNotFound();
  const template = req.query.template || "simple";
  const data = await getBillDetail({
    Bill: PurchaseOrder,
    filter: {
      _id: id,
      org: req.params.orgId,
    },
    NotFound: PurchaseOrderNotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `PurchaseOrder-${data.num}-${data.date}.pdf`,
  });
});
