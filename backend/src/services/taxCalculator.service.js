const Um = require("../models/um.model");
const { getTaxMapForOrgByIds } = require("./tax.service");
const { getUmMapForOrgByIds } = require("./um.service");

exports.calculateTaxes = async (items = [], orgId) => {
  const taxIds = items.map((item) => item.tax);
  const taxIdItemMap = await getTaxIdTaxMap(taxIds, orgId);
  let total = 0,
    totalTax = 0;
  const taxCategories = {};
  for (const item of items) {
    const itemTax = taxIdItemMap[item.tax];

    const itemSubtotal = item.price * item.quantity;
    total += itemSubtotal;

    const currentItemTax = (itemSubtotal * itemTax.percentage) / 100;
    totalTax += currentItemTax;
    updateTaxCategories({
      itemTax,
      taxCategories,
      itemSubtotal,
    });
  }

  return {
    total: parseFloat(total.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    taxCategories,
  };
};

exports.calculateTaxesForBillItemsWithCurrency = async (
  items = [],
  formatCurrency,
  orgId,
) => {
  const taxIds = items.map((item) => item.tax);
  const umIds = items.map((item) => item.um);
  const taxIdItemMap = await getTaxIdTaxMap(taxIds, orgId);
  const umIdsMap = await getUmIdMap(umIds, orgId);
  const itemsWithCalculatedTaxes = items.map((item) => {
    const itemTax = taxIdItemMap[item.tax];
    const price = formatCurrency.format(item.price);
    const itemSubtotal = item.price * item.quantity;
    const tax = (itemSubtotal * itemTax.percentage) / 100;
    const total = formatCurrency.format(itemSubtotal + tax);
    const um = umIdsMap[item.um];
    return {
      name: item.name,
      quantity: item.quantity,
      code : item.code,
      gst: itemTax.name,
      taxAmount: formatCurrency.format(tax),
      um: um.unit,
      price,
      total,
    };
  });
  return itemsWithCalculatedTaxes;
};
async function getTaxIdTaxMap(taxIds = [], orgId) {
  return getTaxMapForOrgByIds(orgId, taxIds);
}
async function getUmIdMap(umIds = [], orgId) {
  return getUmMapForOrgByIds(orgId, umIds);
}

function updateTaxCategories({ itemTax, taxCategories, itemSubtotal }) {
  const type = itemTax.type;
  const calculator = {
    single: updateBySingleTypeTax,
    grouped: updateByGroupedTypeTax,
  };
  const calculateTax = calculator[type];
  calculateTax({ itemTax, taxCategories, itemSubtotal });
}
const makeCategoryKey = (category, percentage) => `${category}@${percentage}%`;

function updateTaxCategory(category, percentage, taxCategories, itemSubtotal) {
  const key = makeCategoryKey(category, percentage);
  const taxAmount = (itemSubtotal * percentage) / 100;
  taxCategories[key] = (taxCategories[key] || 0) + taxAmount;
}

function updateByGroupedTypeTax({ itemTax, taxCategories, itemSubtotal }) {
  itemTax.children.forEach((itemTaxChild) => {
    updateTaxCategory(itemTaxChild.category, itemTaxChild.percentage, taxCategories, itemSubtotal);
  });
}

function updateBySingleTypeTax({ itemTax, taxCategories, itemSubtotal }) {
  updateTaxCategory(itemTax.category, itemTax.percentage, taxCategories, itemSubtotal);
}
