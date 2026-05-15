const { OrgNotFound } = require("../../errors/org.error");
const Invoice = require("../../models/invoice.model");
const OrgModel = require("../../models/org.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Setting = require("../../models/settings.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const { saveBill, getNextSequence } = require("../../services/bill.service");
const { invoiceDto } = require("../../dto/invoice.dto");
const { InvoiceDuplicate, InvoiceNotFound } = require("../../errors/invoice.error");
const { ProformaInvoiceNotFound } = require("../../errors/proformaInvoice.error");

const convertProformaToInvoice = async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
  });
  if (!setting) throw new OrgNotFound();

  const proformaInvoice = await ProformaInvoice.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });

  if (!proformaInvoice) throw new ProformaInvoiceNotFound();

  const num = await executeMongoDbTransaction(async (session) => {
    const sequence = await getNextSequence({
      Bill: Invoice,
      org: req.params.orgId,
      prefixType: "invoice",
      session,
    });

    const proformaData = JSON.parse(JSON.stringify(proformaInvoice));
    const requestBody = {
      ...proformaData,
      date: new Date(),
      poDate: proformaInvoice.poDate ? proformaInvoice.poDate.toISOString() : "",
      org: req.params.orgId,
      sequence,
      prefix: setting.transactionPrefix.invoice,
      poNo: proformaInvoice.poNo,
      shippingCharges: proformaInvoice.shippingCharges || 0,
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

    await ProformaInvoice.updateOne(
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

module.exports = convertProformaToInvoice;
