const getController = require("../bill.controller");
const {
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotFound,
} = require("../../errors/proformaInvoice.error");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const proformaInvoiceDto = require("../../dto/proformaInvoice.dto");
const nextSequence = require("./nextSequence");
const convertProformaToInvoice = require("./convertProformaInvoiceToInvoice");
const controller = getController({
  NotFound: ProformaInvoiceNotFound,
  Duplicate: ProformaInvoiceDuplicate,
  Bill: ProformaInvoice,
  dto: proformaInvoiceDto,
  prefixType: "proformaInvoice",
  relatedDocType: "proformaInvoices",
});

module.exports = {
  ...controller,
  nextSequence,
  convertProformaToInvoice,
};
