const moneyUtils = require("../utils").moneyUtils;

const exportMapper = {
  header: null,
  bodyMapper: (item, { decimalDigits = 2 } = {}) => {
    const formattedItem = { ...item };
    const moneyFields = ['total', 'totalTax', 'shippingCharges', 'grandTotal', 'cgst', 'igst', 'sgst', 'vat', 'cess', 'sal', 'others'];
    moneyFields.forEach(field => {
      if (formattedItem[field] !== undefined && formattedItem[field] !== null) {
        formattedItem[field] = moneyUtils.fromSmallestUnit(formattedItem[field], decimalDigits);
      }
    });
    return {
      ...formattedItem,
      date: new Intl.DateTimeFormat().format(item.date)
    };
  },
};
const exportDataByReceiptType = {
  invoice: exportMapper,
  proforma_invoice: exportMapper,
  purchase_order: exportMapper,
  purchase: exportMapper,
  quotes: exportMapper,
};
module.exports = exportDataByReceiptType;
