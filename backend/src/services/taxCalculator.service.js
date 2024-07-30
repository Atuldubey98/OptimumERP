const Tax = require("../models/tax.model");
const Um = require("../models/um.model");

exports.calculateTaxes = async (items = []) => {
  const taxIds = items.map((item) => item.tax);
  const taxIdItemMap = await getTaxIdTaxMap(taxIds);
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
  currencySymbol
) => {
  const taxIds = items.map((item) => item.tax);
  const umIds = items.map((item) => item.um);
  const taxIdItemMap = await getTaxIdTaxMap(taxIds);
  const umIdsMap = await getUmIdMap(umIds);
  const itemsWithCalculatedTaxes = items.map((item) => {
    const itemTax = taxIdItemMap[item.tax];
    const price = `${currencySymbol} ${item.price.toFixed(2)}`;
    const itemSubtotal = item.price * item.quantity;
    const tax = (itemSubtotal * itemTax.percentage) / 100;
    const total = `${currencySymbol} ${(itemSubtotal + tax).toFixed(2)}`;
    const um = umIdsMap[item.um];
    return {
      name: item.name,
      quantity: item.quantity,
      code : item.code,
      gst: itemTax.name,
      um: um.unit,
      price,
      total,
    };
  });
  return itemsWithCalculatedTaxes;
};

const makeIdMapReducer = (prev, current) => {
  prev[current._id] = current;
  return prev;
};
async function getTaxIdTaxMap(taxIds = []) {
  const taxes = await Tax.find({ _id: { $in: taxIds } })
    .populate("children")
    .lean();
  const taxIdItemMap = taxes.reduce(makeIdMapReducer, {});
  return taxIdItemMap;
}
async function getUmIdMap(umIds = []) {
  const ums = await Um.find({ _id: { $in: umIds } });
  const umIdsMap = ums.reduce(makeIdMapReducer, {});
  return umIdsMap;
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
function updateByGroupedTypeTax({ itemTax, taxCategories, itemSubtotal }) {
  const updateTaxCategoryByChildren = (itemTaxChild) => {
    const category = itemTaxChild.category;
    taxCategories[category] =
      (taxCategories[category] || 0) +
      (itemSubtotal * itemTaxChild.percentage) / 100;
  };
  itemTax.children.forEach(updateTaxCategoryByChildren);
}

function updateBySingleTypeTax({ itemTax, taxCategories, itemSubtotal }) {
  const category = itemTax.category;
  const currentItemTax = (itemSubtotal * itemTax.percentage) / 100;
  taxCategories[category] = (taxCategories[category] || 0) + currentItemTax;
}
