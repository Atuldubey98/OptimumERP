const recurringInvoicesPeriods = require("../constants/recurringInvoicesPeriods");
const recurringInvoicesSchema = require("../dto/recurring_invoices.dto");
const { OrgNotFound } = require("../errors/org.error");
const {
  InvalidRecurrenceValue,
  RecurringInvoiceNotFound,
} = require("../errors/recurring_invoice.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const logger = require("../logger");
const Invoice = require("../models/invoice.model");
const RecurringInvoice = require("../models/recurring_invoices.model");
const Setting = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const OrgModel = require("../models/org.model");
const Party = require("../models/party.model");
const { getTotalAndTax } = require("./quotes.controller");
async function generateInvoiceNumber(orgId) {
  const setting = await Setting.findOne({ org: orgId });
  const invoice = await Invoice.findOne(
    {
      org: orgId,
      financialYear: setting.financialYear,
    },
    { invoiceNo: 1 },
    { sort: { invoiceNo: -1 } }
  ).select("invoiceNo");
  return invoice ? invoice.invoiceNo + 1 : 1;
}
exports.createRecurringInvoice = requestAsyncHandler(async (req, res) => {
  const body = await recurringInvoicesSchema.validateAsync(req.body);
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();
  const recurrenceValue = recurringInvoicesPeriods
    .find((period) => body.period === period.value)
    .validRecurrenceNumbers.find(
      (recurring) => recurring === body.recurrenceNumber
    );
  if (!recurrenceValue) throw new InvalidRecurrenceValue();
  const recurrenceBody = {
    ...body,
    org: req.params.orgId,
    financialYear: setting.financialYear,
  };
  const todaysDate = new Date(new Date().toISOString().split("T")[0]);
  const shouldGenerateInvoiceAlready = new Date(body.startDate) <= todaysDate;
  if (shouldGenerateInvoiceAlready) {
    recurrenceBody.lastInvoiceDate = todaysDate;
    recurrenceBody.noOfInvoicesGenerated = 1;
    const nextInvoiceNumber = await generateInvoiceNumber(req.params.orgId);
    const { total, totalTax, igst, sgst, cgst } = getTotalAndTax(body.items);
    const setting = await Setting.findOne({
      org: req.params.orgId,
    });
    if (!setting) throw new OrgNotFound();
    const invoicePrefix = setting.transactionPrefix.invoice;
    const newInvoice = new Invoice({
      org: req.params.orgId,
      items: body.items,
      billingAddress: body.billingAddress,
      date: todaysDate,
      invoiceNo: nextInvoiceNumber,
      poNo: body.poNo,
      poDate: body.poDate,
      party: body.party,
      createdBy: body.createdBy,
      status: "draft",
      total,
      num: invoicePrefix + nextInvoiceNumber,
      totalTax,
      igst,
      sgst,
      cgst,
      financialYear: setting.financialYear,
    });

    await newInvoice.save();
    const transaction = new Transaction({
      org: req.params.orgId,
      createdBy: body.createdBy,
      docModel: "invoice",
      financialYear: setting.financialYear,
      doc: newInvoice._id,
      total,
      totalTax,
      party: body.party,
      date: newInvoice.date,
    });
    await transaction.save();
    logger.info(`Invoice created ${newInvoice.id}`);
    await OrgModel.updateOne(
      { _id: req.params.orgId },
      { $inc: { "relatedDocsCount.invoices": 1 } }
    );
  }
  const recurringInvoice = new RecurringInvoice(recurrenceBody);
  await recurringInvoice.save();
  return res.status(200).json({ data: recurringInvoice });
});

exports.cronGenerateInvoice = requestAsyncHandler(async (req, res) => {
  const activeRecurrings = await RecurringInvoice.find({
    status: "active",
  })
    .$where("this.recurrenceNumber > this.noOfInvoicesGenerated")
    .exec();

  let totalGeneratedInvoices = 0;
  for (const activeRecurringInvoice of activeRecurrings) {
    const lastInvoiceDate = activeRecurringInvoice.lastInvoiceDate;
    const nextInvoiceDate = getNextInvoiceDate(
      lastInvoiceDate,
      activeRecurringInvoice.period
    );
    const currentDate = new Date();

    const todaysDate = new Date(new Date().toISOString().split("T")[0]);
    if (!lastInvoiceDate || nextInvoiceDate <= todaysDate) {
      totalGeneratedInvoices++;
      const nextInvoiceNumber = await generateInvoiceNumber(
        activeRecurringInvoice.org
      );
      const { total, totalTax, igst, sgst, cgst } = getTotalAndTax(
        activeRecurringInvoice.items
      );
      const setting = await Setting.findOne({
        org: req.params.orgId,
      });
      if (!setting) throw new OrgNotFound();
      const invoicePrefix = setting.transactionPrefix.invoice;
      const newInvoice = new Invoice({
        org: req.params.orgId,
        items: activeRecurringInvoice.items,
        billingAddress: activeRecurringInvoice.billingAddress,
        date: todaysDate,
        invoiceNo: nextInvoiceNumber,
        poNo: activeRecurringInvoice.poNo,
        poDate: activeRecurringInvoice.poDate,
        party: activeRecurringInvoice.party,
        createdBy: activeRecurringInvoice.createdBy,
        status: "draft",
        total,
        num: invoicePrefix + nextInvoiceNumber,
        totalTax,
        igst,
        sgst,
        cgst,
        financialYear: setting.financialYear,
      });

      await newInvoice.save();
      const transaction = new Transaction({
        org: activeRecurringInvoice.org,
        createdBy: activeRecurringInvoice.createdBy,
        docModel: "invoice",
        financialYear: setting.financialYear,
        doc: newInvoice._id,
        total,
        totalTax,
        party: activeRecurringInvoice.party,
        date: newInvoice.date,
      });
      await transaction.save();
      logger.info(`Invoice created ${newInvoice.id}`);
      await OrgModel.updateOne(
        { _id: activeRecurringInvoice.org },
        { $inc: { "relatedDocsCount.invoices": 1 } }
      );

      activeRecurringInvoice.lastInvoiceDate = todaysDate;
      activeRecurringInvoice.noOfInvoicesGenerated =
        activeRecurringInvoice.noOfInvoicesGenerated <
        activeRecurringInvoice.recurrenceNumber
          ? ++activeRecurringInvoice.noOfInvoicesGenerated
          : activeRecurringInvoice.recurrenceNumber;
      await activeRecurringInvoice.save();
    }
  }
  return res
    .status(200)
    .json({ message: `${totalGeneratedInvoices} generated` });
});

function getNextInvoiceDate(lastInvoiceDate, recurrencePeriod) {
  let nextInvoiceDate;

  switch (recurrencePeriod) {
    case "weekly":
      nextInvoiceDate = new Date(lastInvoiceDate);
      nextInvoiceDate.setDate(nextInvoiceDate.getDate() + 7);
      break;
    case "monthly":
      nextInvoiceDate = new Date(lastInvoiceDate);
      nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
      break;
    case "quarterly":
      nextInvoiceDate = new Date(lastInvoiceDate);
      nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 3);
      break;
    case "biannually":
      nextInvoiceDate = new Date(lastInvoiceDate);
      nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 6);
      break;
    default:
      throw new Error("Invalid recurrence period");
  }
  return nextInvoiceDate;
}

exports.getRecurringInvoice = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) throw new RecurringInvoiceNotFound();
  const recurringInvoice = await RecurringInvoice.findOne({
    org: req.params.orgId,
    _id: id,
  }).exec();
  if (!recurringInvoice) throw new RecurringInvoiceNotFound();
  return res.status(200).json({ data: recurringInvoice });
});

exports.updateRecurringInvoice = requestAsyncHandler(async (req, res) => {
  const id = req.params.id;
  const body = await recurringInvoicesSchema.validateAsync(req.body);
  const recurringInvoice = await RecurringInvoice.findOneAndUpdate(
    {
      org: req.params.orgId,
      _id: id,
    },
    body
  );

  
});
