const { isValidObjectId } = require("mongoose");
const { invoiceDto } = require("../dto/invoice.dto");
const { PartyNotFound } = require("../errors/party.error");
const {
  InvoiceNotFound,
  InvoiceDuplicate,
  InvoiceNotDelete,
} = require("../errors/invoice.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Party = require("../models/party.model");
const Invoice = require("../models/invoice.model");
const { getTotalAndTax } = require("./quotes.controller");
const { OrgNotFound } = require("../errors/org.error");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");
const currencies = require("../constants/currencies");
const taxRates = require("../constants/gst");
const ums = require("../constants/um");
const path = require("path");
const Joi = require("joi");
const transporter = require("../mailer");
const Quotes = require("../models/quotes.model");
const ProformaInvoice = require("../models/proforma_invoice.model");
const logger = require("../logger");
const OrgModel = require("../models/org.model");
const { getPaginationParams } = require("../helpers/crud.helper");
const entitiesConfig = require("../constants/entities");
const {
  promiseQrCode,
  renderHtml,
  sendHtmlToPdfResponse,
} = require("../helpers/render_engine.helper");
const {
  saveBill,
  deleteBill,
  getNextSequence,
  getBillDetail,
} = require("../helpers/bill.helper");

exports.createInvoice = requestAsyncHandler(async (req, res) => {
  const requestBody = req.body;
  requestBody.org = req.params.orgId;

  const invoice = await saveBill({
    Bill: Invoice,
    dto: invoiceDto,
    Duplicate: InvoiceDuplicate,
    NotFound: InvoiceNotFound,
    requestBody,
    prefixType: "invoice",
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.invoices": 1 } }
  );
  logger.info(`Invoice created ${invoice.id}`);
  return res.status(201).json({ message: "Invoice created !", data: invoice });
});

exports.updateInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const updatedInvoice = await saveBill({
    Bill: Invoice,
    dto: invoiceDto,
    Duplicate: InvoiceDuplicate,
    NotFound: InvoiceNotFound,
    requestBody,
    prefixType: "invoice",
    billId: req.params.invoiceId,
  });
  logger.info(`Invoice updated ${updatedInvoice.id}`);

  return res.status(200).json({ message: "Invoice updated !" });
});

exports.deleteInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const filter = {
    _id: invoiceId,
    org: req.params.orgId,
  };
  const invoice = await deleteBill({
    Bill: Invoice,
    NotFound: InvoiceNotFound,
    filter,
  });
  await Promise.all(
    [ProformaInvoice, Quotes].map((Model) =>
      Model({ converted: invoiceId }, { converted: null })
    )
  );
  logger.info(`Invoice deleted ${invoice.id}`);
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.invoices": -1 } }
  );
  return res.status(200).json({ message: "Invoice deleted !" });
});

exports.getInvoices = requestAsyncHandler(async (req, res) => {
  const { filter, skip, limit, total, totalPages, page } =
    await getPaginationParams({
      req,
      modelName: entitiesConfig.INVOICES,
      model: Invoice,
    });
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();
  return res.status(200).json({
    data: invoices,
    page,
    limit,
    totalPages,
    total,
    message: "Invoices retrieved successfully",
  });
});

exports.getInvoice = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.invoiceId)) throw new InvoiceNotFound();
  const invoice = await Invoice.findOne({
    _id: req.params.invoiceId,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email ")
    .populate("updatedBy", "name email")
    .populate("org", "name address ");
  if (!invoice) throw new InvoiceNotFound();
  return res.status(200).json({ data: invoice });
});

exports.getNextInvoiceNumber = requestAsyncHandler(async (req, res) => {
  const nextSequence = await getNextSequence({
    Bill: Invoice,
    org: req.params.orgId,
  });
  return res.status(200).json({ data: nextSequence });
});

exports.viewInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const filter = {
    _id: invoiceId,
    org: req.params.orgId,
  };
  const template = req.query.template || "simple";
  const locationTemplate = `templates/${template}`;
  const data = await getBillDetail({
    Bill: Invoice,
    filter,
    NotFound: InvoiceNotFound,
  });
  return res.render(locationTemplate, data);
});

exports.downloadInvoice = requestAsyncHandler(async (req, res) => {
  const template = req.query.template || "simple";
  const invoiceId = req.params.invoiceId;
  const data = await getBillDetail({
    Bill: Invoice,
    filter: {
      _id: invoiceId,
      org: req.params.orgId,
    },
    NotFound: InvoiceNotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `Invoice-${data.num}-${data.date}.pdf`,
  });
});

const paymentDto = Joi.object({
  description: Joi.string().allow("").required().label("Description"),
  amount: Joi.number().required().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().required().label("Date"),
});
exports.recordPayment = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const body = await paymentDto.validateAsync(req.body);
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.invoiceId, org: req.params.orgId },
    { payment: body, updatedBy: req.session.user._id }
  );
  if (!invoice) throw new InvoiceNotFound();
  return res.status(201).json({ message: "Payment added" });
});

exports.sendInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const emailBody = req.body.emails;
  const emails = await Joi.array(Joi.string())
    .min(1)
    .length(5)
    .validateAsync(emailBody);
  const templateName = req.query.template || "simple";
  const locationTemplate = path.join(
    __dirname,
    `../views/templates/${templateName}/index.ejs`
  );
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  const grandTotal = invoice.items.reduce(
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

  const items = invoice.items.map(
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
  const upiUrl = `upi://pay?pa=${invoice.org?.bank?.upi}&am=${grandTotal}`;
  const upiQr =
    setting.printSettings.upiQr && invoice.org.bank.upi
      ? await promiseQrCode(upiUrl)
      : null;
  const bank = setting.printSettings.bank && invoice.org.bank;
  ejs.renderFile(
    locationTemplate,
    {
      entity: invoice,
      num: invoice.num,
      items,
      upiQr,
      bank,
      grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
      total: `${currencySymbol} ${invoice.total.toFixed(2)}`,
      sgst: `${currencySymbol} ${invoice.sgst.toFixed(2)}`,
      cgst: `${currencySymbol} ${invoice.cgst.toFixed(2)}`,
      igst: `${currencySymbol} ${invoice.igst.toFixed(2)}`,
      title: "Invoice",
      billMetaHeading: "Invoice information",
      partyMetaHeading: "Bill To",
    },
    (err, html) => {
      if (err) throw err;
      const bufs = [];
      wkhtmltopdf(
        html,
        {
          enableLocalFileAccess: true,
          pageSize: "A4",
        },
        (err, stream) => {
          if (err) throw err;
          stream.on("data", function (data) {
            bufs.push(data);
          });
          stream.on("end", async function () {
            const pdfBuffer = new Buffer.concat(bufs);
            await transporter.sendMail({
              to: emails.join(","),
              from: req.session?.user?.email,
              attachments: [
                {
                  filename: "Invoice.pdf",
                  content: pdfBuffer,
                },
              ],
              subject: ``,
              text: `Here is your invoice with`,
            });
            return res.status(200).json({ message: "Invoice sent " });
          });
        }
      );
    }
  );
});
