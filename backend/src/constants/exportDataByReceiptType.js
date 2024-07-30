const exportMapper = {
  header: null,
  bodyMapper: (item) => ({...item, date : new Intl.DateTimeFormat().format(item.date)}),
};
const exportDataByReceiptType = {
  invoice: exportMapper,
  proforma_invoice: exportMapper,
  purchase_order: exportMapper,
  purchase: exportMapper,
  quotes: exportMapper,
};
module.exports = exportDataByReceiptType;
