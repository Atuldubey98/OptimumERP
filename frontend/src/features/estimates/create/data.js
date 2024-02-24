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
const taxRates = [
  {
    value: "none",
    label: "NONE",
  },
  {
    value: "GST:5",
    label: "GST@5%",
  },
  {
    value: "GST:18",
    label: "GST@18%",
  },
  {
    value: "GST:12",
    label: "GST@12%",
  },
  {
    value: "GST:28",
    label: "GST@28%",
  },
  {
    value: "IGST:5",
    label: "IGST@5%",
  },
  {
    value: "IGST:12",
    label: "IGST@12%",
  },
  {
    value: "IGST:28",
    label: "IGST@28%",
  },
];
const ums = [
  {
    value: "pcs",
    label: "Pieces",
  },
  {
    value: "no",
    label: "NOS",
  },
  {
    value: "kg",
    label: "Kilograms",
  },
  {
    value: "g",
    label: "Grams",
  },
  {
    value: "lb",
    label: "Pounds",
  },
  {
    value: "oz",
    label: "Ounces",
  },
  {
    value: "m",
    label: "Meters",
  },
  {
    value: "cm",
    label: "Centimeters",
  },
  {
    value: "mm",
    label: "Millimeters",
  },
  {
    value: "km",
    label: "Kilometers",
  },
  {
    value: "mi",
    label: "Miles",
  },
  {
    value: "L",
    label: "Liters",
  },
  {
    value: "ml",
    label: "Milliliters",
  },
  {
    value: "gal",
    label: "Gallons",
  },
  {
    value: "pt",
    label: "Pints",
  },
  {
    value: "qt",
    label: "Quarts",
  },
  {
    value: "ft",
    label: "Feet",
  },
  {
    value: "in",
    label: "Inches",
  },
  {
    value: "yd",
    label: "Yards",
  },
  {
    value: "sqm",
    label: "Square Meters",
  },
  {
    value: "sqft",
    label: "Square Feet",
  },
  {
    value: "sqin",
    label: "Square Inches",
  },
  {
    value: "sqyd",
    label: "Square Yards",
  },
  {
    value: "cbm",
    label: "Cubic Meters",
  },
  {
    value: "cft",
    label: "Cubic Feet",
  },
  {
    value: "cin",
    label: "Cubic Inches",
  },
  {
    value: "cyd",
    label: "Cubic Yards",
  },
  {
    value: "doz",
    label: "Dozens",
  },
];
const defaultQuoteItem = {
  name: "",
  quantity: 1,
  um: "none",
  gst: "none",
  price: 0,
};
const defaultInvoiceItem = {
  name: "",
  code: "",
  quantity: 1,
  um: "none",
  gst: "none",
  price: 0,
};
function calculateGrandTotalWithTax(quoteItems) {
  let grandTotal = 0;
  let totalTax = 0;
  let total = 0;
  quoteItems.forEach((quoteItem) => {
    const itemTotal = isNaN(parseFloat(quoteItem.price * quoteItem.quantity))
      ? 0
      : parseFloat(quoteItem.price * quoteItem.quantity);
    const gstPercentage =
      quoteItem.gst === "none" ? 0 : parseFloat(quoteItem.gst.split(":")[1]);
    const tax = isNaN(parseFloat((itemTotal * gstPercentage) / 100))
      ? 0
      : parseFloat((itemTotal * gstPercentage) / 100);
    const subtotal = itemTotal + tax;
    total += itemTotal;
    totalTax += tax;
    grandTotal += subtotal;
  });
  return { grandTotal, totalTax, total };
}
export {
  statusList,
  taxRates,
  ums,
  defaultQuoteItem,
  defaultInvoiceItem,
  calculateGrandTotalWithTax,
};
