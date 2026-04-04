
const DEFAULT_GSTR_TAX_CATEGORIES = ["cgst", "sgst", "igst"];
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

const formatAmount = (value = 0) => Number(value || 0).toFixed(2);

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
  header.grandTotal = "Grand Total";
  return header;
};

const mapTaxCategoryValues = (taxCategoryKeys, taxCategories = {}) =>
  Object.fromEntries(
    taxCategoryKeys.map((key) => [key, formatAmount(taxCategories[key])])
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
    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      address: item.party?.billingAddress,
      poNo: item.poNo,
      poDate: item.poDate ? new Date(item.poDate).toLocaleDateString() : "",
      num: item.num,
      date: formatDate(item.date),
      totalTax: formatAmount(item.totalTax),
      grandTotal: formatAmount(getGrandTotal(item)),
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

    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      date: formatDate(item.date),
      totalTax: formatAmount(item.totalTax),
      grandTotal: formatAmount(getGrandTotal(item)),
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
    bodyMapper: (item) => ({
      _id: item._id,
      num: item.doc?.num,
      type: item?.docModel,
      relatedTo: item?.party?.name || item.doc?.description || "",
      amount: formatAmount(getGrandTotal(item)),
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
    bodyMapper: (item, { taxCategoryKeys = DEFAULT_GSTR_TAX_CATEGORIES } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      date: formatDate(item.date),
      gstNo: item.party?.gstNo,
      ...mapTaxCategoryValues(taxCategoryKeys, item.taxCategories),
      grandTotal: formatAmount(getGrandTotal(item)),
    }),
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
    bodyMapper: (item, { taxCategoryKeys = DEFAULT_GSTR_TAX_CATEGORIES } = {}) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      gstNo: item.party?.gstNo,
      date: formatDate(item.date),
      ...mapTaxCategoryValues(taxCategoryKeys, item.taxCategories),
      grandTotal: formatAmount(getGrandTotal(item)),
    }),
  },
};

module.exports = reportDataByType;
