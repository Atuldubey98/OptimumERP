// Status labels are internationalized in the SelectStatus component
// Keep this structure for backward compatibility but labels should be replaced with translations at render time
const statusList = [
  {
    type: "draft",
    label: "quote_ui.status.draft",
    colorScheme: "blue",
  },
  {
    type: "pending",
    label: "quote_ui.status.pending",
    colorScheme: "yellow",
  },
  {
    type: "sent",
    label: "quote_ui.status.sent",
    colorScheme: "green",
  },
  {
    type: "accepted",
    label: "quote_ui.status.accepted",
    colorScheme: "teal",
  },
  {
    type: "declined",
    label: "quote_ui.status.declined",
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
function calculateGrandTotalWithTax({ quoteItems, taxes, shippingCharges = 0 }) {
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

  grandTotal += parseFloat(shippingCharges) || 0;

  return { grandTotal, totalTax, total };
}
export {
  statusList,
  defaultQuoteItem,
  defaultInvoiceItem,
  calculateGrandTotalWithTax,
};
