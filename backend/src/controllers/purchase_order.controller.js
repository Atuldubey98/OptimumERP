const { isValidObjectId } = require("mongoose");
const { purchaseOrderDto } = require("../dto/purchase_order.dto");
const {
  PurchaseOrderNotFound,
  PurchaseOrderDuplicate,
} = require("../errors/purchase_order.error");
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
const {
  getPaginationParams,
  hasUserReachedCreationLimits,
} = require("../helpers/crud.helper");
const entities = require("../constants/entities");
const Setting = require("../models/settings.model");
const { ToWords } = require("to-words");
const ums = require("../constants/um");
const taxRates = require("../constants/gst");
const currencies = require("../constants/currencies");

exports.createPurchaseOrder = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const purchase = await saveBill({
    Bill: PurchaseOrder,
    dto: purchaseOrderDto,
    NotFound: PurchaseOrderNotFound,
    Duplicate: PurchaseOrderDuplicate,
    requestBody,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.purchaseOrders": 1 } }
  );
  logger.info(`Purchase Invoice created ${purchase.id}`);
  return res.status(201).json({ data: purchase, message: "Purchase created" });
});

exports.getPurchaseOrder = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new PurchaseOrderNotFound();
  const purchaseOrder = await PurchaseOrder.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email ")
    .populate("updatedBy", "name email")
    .populate("org", "name address ");
  if (!purchaseOrder) throw new PurchaseOrderNotFound();
  return res.status(200).json({ data: purchaseOrder });
});
exports.getPurchaseOrders = requestAsyncHandler(async (req, res) => {
  const { filter, limit, page, skip, total, totalPages } =
    await getPaginationParams({
      model: PurchaseOrder,
      modelName: entities.PURCHASE_ORDERS,
      req,
    });
  const purchaseOrders = await PurchaseOrder.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();
  return res.status(200).json({
    data: purchaseOrders,
    page,
    limit,
    totalPages,
    reachedLimit: hasUserReachedCreationLimits({
      relatedDocsCount: res.locals.organization.relatedDocsCount,
      userLimits: req.session.user.limits,
      key: "purchaseOrders",
    }),
    total,
  });
});

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
  return res.status(201).json({ message: "Purchase order updated" });
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

exports.viewPurchaseOrder = async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
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
  } catch (error) {
    return res.render(`templates/error`);
  }
};

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
