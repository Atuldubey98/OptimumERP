const billService = require("../../services/bill.service");
const contactService = require("../../services/contact.service");
const Contact = require("../../models/contacts.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const Quotes = require("../../models/quotes.model");
const { InvoiceNotFound } = require("../../errors/invoice.error");
const { PurchaseNotFound } = require("../../errors/purchase.error");
const { ProformaInvoiceNotFound } = require("../../errors/proformaInvoice.error");
const { PurchaseOrderNotFound } = require("../../errors/purchaseOrder.error");
const { QuoteNotFound } = require("../../errors/quote.error");

const models = {
  invoice: {
    Bill: Invoice,
    NotFound: InvoiceNotFound,
    prefixType: "invoice",
  },
  purchase: {
    Bill: Purchase,
    NotFound: PurchaseNotFound,
    prefixType: "purchase",
  },
  proforma_invoice: {
    Bill: ProformaInvoice,
    NotFound: ProformaInvoiceNotFound,
    prefixType: "proformaInvoice",
  },
  purchase_order: {
    Bill: PurchaseOrder,
    NotFound: PurchaseOrderNotFound,
    prefixType: "purchaseOrder",
  },
  quotes: {
    Bill: Quotes,
    NotFound: QuoteNotFound,
    prefixType: "quotation",
  },
};

const smtpHandler = {
  send_email: async (params) => {
    try {
      const { type, billId, billNumber, to, cc, subject, body, replyToMessageId, org, user, attachDocument } = params;
      const toEmails = to;
      const ccEmails = cc || [];

      if (attachDocument && type && (billId || billNumber)) {
        const modelProps = models[type];
        if (!modelProps) throw new Error(`Invalid document type: ${type}`);
        const { Bill } = modelProps;

        const filter = { org };
        if (billId) filter._id = billId;
        if (billNumber) filter.num = billNumber;

        const bill = await Bill.findOne(filter).lean();
        if (!bill) throw new modelProps.NotFound();

        const allEmails = [...new Set([...toEmails, ...ccEmails])];
        const foundContacts = await Contact.find({
          org,
          email: { $in: allEmails }
        }).lean();

        const foundEmails = foundContacts.map(c => c.email.toLowerCase());
        const missingEmails = allEmails.filter(email => !foundEmails.includes(email.toLowerCase()));

        if (missingEmails.length > 0) {
          throw new Error(`The following email addresses were not found in your contacts: ${missingEmails.join(", ")}. Please add them as contacts for this party before sending documents.`);
        }

        const invalidContacts = foundContacts.filter(c => c.party.toString() !== bill.party.toString());
        if (invalidContacts.length > 0) {
          const invalidEmails = invalidContacts.map(c => c.email);
          throw new Error(`The following emails belong to contacts associated with a different party: ${invalidEmails.join(", ")}. For security, documents can only be sent to contacts associated with the document's party.`);
        }

        const info = await executeMongoDbTransaction(async (session) => {
          return await billService.sendBill({
            Bill,
            filter: { _id: bill._id, org },
            NotFound: modelProps.NotFound,
            orgId: org,
            user,
            session,
            prefixType: modelProps.prefixType,
            toEmails,
            ccEmails,
            subject,
            body,
            replyToMessageId
          });
        });

        return {
          message: `I've sent the ${type} ${bill.num} to ${toEmails.join(", ")}.`,
          messageId: info.messageId,
        };
      }

      const info = await billService.sendEmail({
        orgId: org,
        user,
        toEmails,
        ccEmails,
        subject,
        body,
        replyToMessageId
      });

      return {
        message: `Email sent to ${toEmails.join(", ")}.`,
        messageId: info.messageId,
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = smtpHandler;
