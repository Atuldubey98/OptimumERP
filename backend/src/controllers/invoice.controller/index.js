const getController = require("../bill.controller");
const nextSequence = require("./next_sequence");
const payment = require("./payment");
const {
  InvoiceDuplicate,
  InvoiceNotFound,
} = require("../../errors/invoice.error");
const Invoice = require("../../models/invoice.model");
const { invoiceDto } = require("../../dto/invoice.dto");

const controller = getController({
  NotFound: InvoiceNotFound,
  Duplicate: InvoiceDuplicate,
  Bill: Invoice,
  dto: invoiceDto,
  prefixType: "invoice",
  relatedDocType: "invoices",
});
module.exports = {
  ...controller,
  nextSequence,
  payment,
};
