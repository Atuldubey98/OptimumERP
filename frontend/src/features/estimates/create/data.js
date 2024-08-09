const statusList = [
  {
    type: "draft",
    label: "Draft",
    colorScheme: "blue",
  },
  {
    type: "pending",
    label: "Pending",
    colorScheme: "yellow",
  },
  {
    type: "sent",
    label: "Sent",
    colorScheme: "green",
  },
  {
    type: "accepted",
    label: "Accepted",
    colorScheme: "teal",
  },
  {
    type: "declined",
    label: "Declined",
    colorScheme: "red",
  },
];

const defaultQuoteItem = {
  name: "",
  quantity: 1,
  um: "none",
  tax: "",
  price: 0,
  code: "",
};
const defaultInvoiceItem = {
  name: "",
  code: "",
  quantity: 1,
  um: "none",
  tax: "",
  price: 0,
};
function calculateGrandTotalWithTax({ quoteItems, taxes, discount }) {
  let grandTotal = 0;
  let totalTax = 0;
  let total = 0;
  quoteItems.forEach((quoteItem) => {
    const itemTotal = isNaN(parseFloat(quoteItem.price * quoteItem.quantity))
      ? 0
      : parseFloat(quoteItem.price * quoteItem.quantity);
    const selectedtax = taxes.find((tax) => tax._id === quoteItem.tax);
    const gstPercentage = selectedtax ? selectedtax.percentage : 0;
    const tax = isNaN(parseFloat((itemTotal * gstPercentage) / 100))
      ? 0
      : parseFloat((itemTotal * gstPercentage) / 100);
    const subtotal = itemTotal + tax;
    total += itemTotal;
    totalTax += tax;
    grandTotal += subtotal;
  });
  const discountAmount =
    discount.type === "%" ? (total * discount.value) / 100 : discount.value;
  const currentTotal = total - discountAmount;
  return { grandTotal, totalTax, total: currentTotal };
}
export {
  statusList,
  defaultQuoteItem,
  defaultInvoiceItem,
  calculateGrandTotalWithTax,
};
