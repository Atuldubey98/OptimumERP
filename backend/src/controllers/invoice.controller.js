const { isValidObjectId } = require("mongoose");
const { invoiceDto } = require("../dto/invoice.dto");
const { CustomerNotFound } = require("../errors/customer.error");
const { InvoiceNotFound } = require("../errors/invoice.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Customer = require("../models/customer.model");
const Invoice = require("../models/invoice,.model");
const { getTotalAndTax } = require("./quotes.controller");

exports.createInvoice = requestAsyncHandler(async (req, res) => {
  const body = await invoiceDto.validateAsync(req.body);
  const { total, totalTax } = getTotalAndTax(body.items);
  const customer = await Customer.findOne({
    _id: body.customer,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  const newInvoice = new Invoice({
    org: req.params.orgId,
    ...body,
    total,
    totalTax,
  });
  await newInvoice.save();
  return res.status(201).json({ message: "Quote created !", data: newInvoice });
});

exports.updateInvoice = requestAsyncHandler(async (req, res) => {
  const { total, totalTax } = getTotalAndTax(req.body.items);
  const body = await invoiceDto.validateAsync(req.body);

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: req.params.invoiceId, org: req.params.orgId },
    {
      ...body,
      total,
      totalTax,
    }
  );
  if (!updatedInvoice) throw new InvoiceNotFound();
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

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer")
    .populate("org")
    .exec();

  return res.status(200).json({
    data: invoices,
    message: "Invoices retrieved successfully",
  });
});

exports.getInvoice = requestAsyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.invoiceId)) throw new InvoiceNotFound();
  const invoice = await Invoice.findOne({
    _id: req.params.invoiceId,
    org: req.params.orgId,
  })
    .populate("customer", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
  if (!invoice) throw new InvoiceNotFound();
  return res.status(200).json({ data: invoice });
});

exports.getNextInvoiceNumber = requestAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne(
    {
      org: req.params.orgId,
    },
    { invoiceNo: 1 },
    { sort: { invoiceNo: -1 } }
  ).select("invoiceNo");
  return res.status(200).json({ data: invoice ? invoice.invoiceNo + 1 : 1 });
});

exports.downloadInvoice = requestAsyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  if (!isValidObjectId(invoiceId)) throw new InvoiceNotFound();

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    org: req.params.orgId,
  })
    .populate("customer", "name _id")
    .populate("createdBy", "name email _id")
    .populate("org", "name address _id");
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
  return res.render("pdf/invoice", {
    title: `Invoice-${invoice.invoiceNo}-${invoice.date}`,
    invoice,
    grandTotal,
  });
});
