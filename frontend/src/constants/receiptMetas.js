const receiptMetas = {
  invoices: {
    label: "Invoice",
    partyNameLabel: "Bill To",
    receiptHomeAppUrl: `/invoices`,
  },
  quotes: {
    label: "Quotation",
    partyNameLabel: "Quotation To",
    receiptHomeAppUrl: `/estimates`,
  },
  purchaseOrders: {
    label: "Purchase order",
    partyNameLabel: "Order To",
    receiptHomeAppUrl: `/purchaseOrders`,
  },
  proformaInvoices: {
    label: "Proforma Invoice",
    partyNameLabel: "Bill To",
    receiptHomeAppUrl: `/proformaInvoices`,
  },
  purchases: {
    label: "Purchase Invoice",
    partyNameLabel: "Bill From",
    receiptHomeAppUrl: `/purchases`,
  },
};

export default receiptMetas;
