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
const QRCode = require("qrcode");
const Joi = require("joi");
const transporter = require("../mailer");
const Quotes = require("../models/quotes.model");
const ProformaInvoice = require("../models/proforma_invoice.model");
const promiseQrCode = (value) => {
  return new Promise((res, rej) => {
    QRCode.toDataURL(value, function (err, url) {
      if (err) rej(err);
      res(url);
    });
  });
};

exports.createInvoice = requestAsyncHandler(async (req, res) => {
  const body = await invoiceDto.validateAsync(req.body);
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
  const existingInvoice = await Invoice.findOne({
    org: req.params.orgId,
    invoiceNo: body.invoiceNo,
    financialYear: setting.financialYear,
  });
  const invoicePrefix = setting.transactionPrefix.invoice;
  if (existingInvoice) throw InvoiceDuplicate(body.invoiceNo);
  const newInvoice = new Invoice({
    org: req.params.orgId,
    ...body,
    total,
    num: invoicePrefix + body.invoiceNo,
    totalTax,
    igst,
    sgst,
    cgst,
    financialYear: setting.financialYear,
  });

  await newInvoice.save();
  const transaction = new Transaction({
    org: req.params.orgId,
    createdBy: req.body.createdBy,
    docModel: "invoice",
    financialYear: setting.financialYear,
    doc: newInvoice._id,
    total,
    totalTax,
    party: body.party,
    date: newInvoice.date,
  });
  await transaction.save();
  return res
    .status(201)
    .json({ message: "Invoice created !", data: newInvoice });
});

exports.updateInvoice = requestAsyncHandler(async (req, res) => {
  const { total, totalTax, cgst, sgst, igst } = getTotalAndTax(req.body.items);
  const body = await invoiceDto.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  }).select("transactionPrefix");
  if (!setting) throw new OrgNotFound();
  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: req.params.invoiceId, org: req.params.orgId },
    {
      ...body,
      total,
      num: setting.transactionPrefix.invoice + body.invoiceNo,
      totalTax,
      sgst,
      cgst,
      igst,
    }
  );
  const updateTransaction = await Transaction.findOneAndUpdate(
    {
      org: req.params.orgId,
      docModel: "invoice",
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
  if (!updatedInvoice || !updateTransaction) throw new InvoiceNotFound();
  return res.status(200).json({ message: "Invoice updated !" });
});

exports.deleteInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();

  const invoice = await Invoice.findOneAndDelete({
    _id: invoiceId,
    org: req.params.orgId,
  });
  if (!invoice) throw new InvoiceNotFound();
  await Quotes.findOneAndUpdate({ converted: invoiceId }, { converted: null });
  await ProformaInvoice.findOneAndUpdate(
    { converted: invoiceId },
    { converted: null }
  );
  const transaction = await Transaction.findOneAndDelete({
    org: req.params.orgId,
    docModel: "invoice",
    doc: invoiceId,
  });
  if (!transaction) throw new InvoiceNotFound();
  return res.status(200).json({ message: "Invoice deleted !" });
});

exports.getInvoices = requestAsyncHandler(async (req, res) => {
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
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
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
    .populate("party", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
  if (!invoice) throw new InvoiceNotFound();
  return res.status(200).json({ data: invoice });
});

exports.getNextInvoiceNumber = requestAsyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ org: req.params.orgId });
  const invoice = await Invoice.findOne(
    {
      org: req.params.orgId,
      financialYear: setting.financialYear,
    },
    { invoiceNo: 1 },
    { sort: { invoiceNo: -1 } }
  ).select("invoiceNo");
  return res.status(200).json({ data: invoice ? invoice.invoiceNo + 1 : 1 });
});

exports.viewInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
  const templateName = req.query.template || "simple";
  const locationTemplate = `templates/${templateName}`;
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    org: req.params.orgId,
  })
    .populate("party", "name gstNo panNo")
    .populate("createdBy", "name email")
    .populate("org", "name address gstNo panNo bank");
  if (!invoice) throw new InvoiceNotFound();
  const grandTotal = (invoice.items || []).reduce(
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
  const upiUrl = `upi://pay?pa=${invoice.org?.bank?.upi}&am=${grandTotal}`;
  const upiQr =
    setting.printSettings.upiQr && invoice.org.bank.upi
      ? await promiseQrCode(upiUrl)
      : null;

  const bank = setting.printSettings.bank && invoice.org.bank;
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
  return res.render(locationTemplate, {
    entity: invoice,
    num: invoice.num,
    items,
    bank,
    upiQr,
    grandTotal: `${currencySymbol} ${grandTotal.toFixed(2)}`,
    total: `${currencySymbol} ${invoice.total.toFixed(2)}`,
    sgst: `${currencySymbol} ${invoice.sgst.toFixed(2)}`,
    cgst: `${currencySymbol} ${invoice.cgst.toFixed(2)}`,
    igst: `${currencySymbol} ${invoice.igst.toFixed(2)}`,
    title: "Invoice",
    billMetaHeading: "Invoice information",
    partyMetaHeading: "Bill To",
  });
});

exports.downloadInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();
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
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-disposition": `attachment;filename=invoice - ${invoice.date}.pdf`,
      });
      wkhtmltopdf(html, {
        enableLocalFileAccess: true,
        pageSize: "A4",
      }).pipe(res);
    }
  );
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
