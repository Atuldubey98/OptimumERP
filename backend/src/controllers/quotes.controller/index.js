const getController = require("../bill.controller");
const {
  QuoteNotFound,
  QuotationDuplicate,
} = require("../../errors/quote.error");
const Quotes = require("../../models/quotes.model");
const { quoteDto } = require("../../dto/quotes.dto");
const convertQuoteToInvoice = require("./convertQuoteToInvoice");
const nextSequence = require("./nextSequence");
const controller = getController({
  NotFound: QuoteNotFound,
  Duplicate: QuotationDuplicate,
  Bill: Quotes,
  dto: quoteDto,
  prefixType: "quotation",
  relatedDocType: "quotes",
});

module.exports = {
  ...controller,
  convertQuoteToInvoice,
  nextSequence,
};
