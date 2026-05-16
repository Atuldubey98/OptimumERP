
const DEFAULT_GSTR_TAX_CATEGORIES = [];
const PREFERRED_TAX_CATEGORY_ORDER = [
  "cgst",
  "sgst",
  "igst",
  "vat",
  "cess",
  "sal",
  "others",
  "none",
];

const formatAmount = (value = 0, decimalDigits = 2) => (Number(value || 0) / Math.pow(10, decimalDigits)).toFixed(decimalDigits);

const getGrandTotal = (item = {}) =>
  Number(item.total || 0) +
  Number(item.totalTax || 0) +
  Number(item.shippingCharges || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

const getOrderedTaxCategoryKeys = (items = [], defaultCategories = []) => {
  const taxCategoryKeys = new Set(defaultCategories);
  items.forEach((item) => {
    Object.entries(item.taxCategories || {}).forEach(([key, amount]) => {
      if (amount !== undefined && amount !== null) taxCategoryKeys.add(key);
    });
  });
  return Array.from(taxCategoryKeys).sort((left, right) => {
    const leftIndex = PREFERRED_TAX_CATEGORY_ORDER.indexOf(left);
    const rightIndex = PREFERRED_TAX_CATEGORY_ORDER.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
};

const buildGstrHeader = ({ dateLabel, numberLabel, taxCategoryKeys }) => {
  const header = {
    gstNo: "Party GST No",
    partyName: "Party Name",
    date: dateLabel,
    num: numberLabel,
  };
  taxCategoryKeys.forEach((key) => {
    header[key] = key.toUpperCase();
  });
  header.totalTax = "Total Tax";
  header.total = "Total";
  header.shippingCharges = "Shipping Charges";
  header.grandTotal = "Grand Total";
  return header;
};

const mapTaxCategoryValues = (taxCategoryKeys, taxCategories = {}, decimalDigits = 2) =>
  Object.fromEntries(
    taxCategoryKeys.map((key) => [key, formatAmount(taxCategories[key], decimalDigits)])
  );

const reportDataByType = {
  sale: {
    header: {
      num: "Invoice Number",
      partyName: "Party Name",
      address: "Party Address",
      date: "Date",
      totalTax: "Total Tax",
      poNo: "Purchase Order Number",
      poDate: "Purchase Order Date",
      grandTotal: "Grand Total",
      status: "Status",
    },
    bodyMapper: (item, { decimalDigits = 2 } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      address: item.party?.billingAddress,
      poNo: item.poNo,
      poDate: item.poDate ? new Date(item.poDate).toLocaleDateString() : "",
      num: item.num,
      date: formatDate(item.date),
      totalTax: formatAmount(item.totalTax, decimalDigits),
      grandTotal: formatAmount(getGrandTotal(item), decimalDigits),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  purchase: {
    header: {
      num: "Purchase Number",
      partyName: "Party Name",
      date: "Date",
      totalTax: "Total Tax",
      grandTotal: "Grand Total",
      status: "Status",
    },

    bodyMapper: (item, { decimalDigits = 2 } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      date: formatDate(item.date),
      totalTax: formatAmount(item.totalTax, decimalDigits),
      grandTotal: formatAmount(getGrandTotal(item), decimalDigits),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  transactions: {
    header: {
      type: "Type",
      amount: "Amount",
      relatedTo: "Related To",
      createdAt: "Done at",
      num: "Num",
    },
    bodyMapper: (item, { decimalDigits = 2 } = {}) => ({
      _id: item._id,
      num: item.doc?.num,
      type: item?.docModel,
      relatedTo: item?.party?.name || item.doc?.description || "",
      amount: formatAmount(getGrandTotal(item), decimalDigits),
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    }),
  },
  gstr1: {
    getTaxCategoryKeys: (items) =>
      getOrderedTaxCategoryKeys(items, DEFAULT_GSTR_TAX_CATEGORIES),
    getHeader: ({ taxCategoryKeys }) =>
      buildGstrHeader({
        dateLabel: "Invoice Date",
        numberLabel: "Invoice No.",
        taxCategoryKeys,
      }),
    bodyMapper: (item, { taxCategoryKeys = DEFAULT_GSTR_TAX_CATEGORIES, decimalDigits = 2 } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      date: formatDate(item.date),
      gstNo: item.party?.gstNo,
      ...mapTaxCategoryValues(taxCategoryKeys, item.taxCategories, decimalDigits),
      totalTax: formatAmount(item.totalTax, decimalDigits),
      total: formatAmount(item.total, decimalDigits),
      shippingCharges: formatAmount(item.shippingCharges, decimalDigits),
      grandTotal: formatAmount(getGrandTotal(item), decimalDigits),
    }),
    itemSheet: {
      header: {
        parentNum: "Invoice No.",
        date: "Invoice Date",
        partyName: "Party Name",
        name: "Item Name",
        code: "HSN Code",
        quantity: "Quantity",
        price: "Rate",
        total: "Total",
      },
      bodyMapper: (parent, item, { decimalDigits = 2 } = {}) => ({
        parentNum: parent.num,
        date: formatDate(parent.date),
        partyName: parent.party?.name,
        name: item.name,
        code: item.code || "",
        quantity: item.quantity,
        price: formatAmount(item.price, decimalDigits),
        total: formatAmount(item.quantity * item.price, decimalDigits),
      }),
    },
  },
  gstr2: {
    getTaxCategoryKeys: (items) =>
      getOrderedTaxCategoryKeys(items, DEFAULT_GSTR_TAX_CATEGORIES),
    getHeader: ({ taxCategoryKeys }) =>
      buildGstrHeader({
        dateLabel: "Purchase Date",
        numberLabel: "Purchase No.",
        taxCategoryKeys,
      }),
    bodyMapper: (item, { taxCategoryKeys = DEFAULT_GSTR_TAX_CATEGORIES, decimalDigits = 2 } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      gstNo: item.party?.gstNo,
      date: formatDate(item.date),
      ...mapTaxCategoryValues(taxCategoryKeys, item.taxCategories, decimalDigits),
      totalTax: formatAmount(item.totalTax, decimalDigits),
      total: formatAmount(item.total, decimalDigits),
      shippingCharges: formatAmount(item.shippingCharges, decimalDigits),
      grandTotal: formatAmount(getGrandTotal(item), decimalDigits),
    }),
    itemSheet: {
      header: {
        parentNum: "Purchase No.",
        date: "Purchase Date",
        partyName: "Party Name",
        name: "Item Name",
        code: "HSN Code",
        quantity: "Quantity",
        price: "Rate",
        total: "Total",
      },
      bodyMapper: (parent, item, { decimalDigits = 2 } = {}) => ({
        parentNum: parent.num,
        date: formatDate(parent.date),
        partyName: parent.party?.name,
        name: item.name,
        code: item.code || "",
        quantity: item.quantity,
        price: formatAmount(item.price, decimalDigits),
        total: formatAmount(item.quantity * item.price, decimalDigits),
      }),
    },
  },
};

module.exports = reportDataByType;
