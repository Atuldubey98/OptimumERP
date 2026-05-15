const { OrgNotFound } = require("../../errors/org.error");
const Invoice = require("../../models/invoice.model");
const OrgModel = require("../../models/org.model");
const Quotes = require("../../models/quotes.model");
const Setting = require("../../models/settings.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const { saveBill, getNextSequence } = require("../../services/bill.service");
const { invoiceDto } = require("../../dto/invoice.dto");
const { InvoiceDuplicate, InvoiceNotFound } = require("../../errors/invoice.error");
const { QuoteNotFound } = require("../../errors/quote.error");
const convertQuoteToInvoice = async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();

  const quote = await Quotes.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });

  if (!quote) throw new QuoteNotFound();

  const num = await executeMongoDbTransaction(async (session) => {
    const sequence = await getNextSequence({
      Bill: Invoice,
      org: req.params.orgId,
      prefixType: "invoice",
      session,
    });

    const quoteData = JSON.parse(JSON.stringify(quote));

    const requestBody = {
      ...quoteData,
      date: new Date(),
      sequence,
      prefix: setting.transactionPrefix.invoice,
      poNo: quote.quoteNo,
      poDate: quote.date.toISOString(),
      status: "draft",
      createdBy: req.session.user._id,
      terms: "Thanks for business !",
    };

    const bill = await saveBill({
      Bill: Invoice,
      dto: invoiceDto,
      Duplicate: InvoiceDuplicate,
      NotFound: InvoiceNotFound,
      requestBody,
      prefixType: "invoice",
      user: req.session.user,
      session,
    });

    await Quotes.updateOne(
      { _id: req.params.id },
      { $set: { converted: bill._id } },
      { session }
    );

    await OrgModel.updateOne(
      { _id: req.params.orgId },
      { $inc: { "relatedDocsCount.invoices": 1 } },
      { session }
    );

    return bill.num;
  });
  return res.status(201).json({
    message: req.t("common:api.invoice_created_with_number", { num }),
  });
};

module.exports = convertQuoteToInvoice;