const billTypes = Object.freeze({
    INVOICE : "invoice",
    PURCHASE : "purchase",
    QUOTE : "quotes",
    PURCHASE_ORDER : "purchase_order",
    PROFORMA_INVOICE : "proforma_invoice",
});

module.exports = {
    [billTypes.INVOICE] : "Invoice",
    [billTypes.PURCHASE] : "Purchase Invoice",
    [billTypes.QUOTE] : "Quotation",
    [billTypes.PURCHASE_ORDER] : "Purchase Order",
    [billTypes.PROFORMA_INVOICE] : "Proforma Invoice",
}