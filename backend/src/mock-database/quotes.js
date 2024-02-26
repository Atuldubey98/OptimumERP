const Quotes = require("../models/quotes.model");
const Invoice = require("../models/invoice.model");
function getRandomDate(startDate, endDate) {
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();
  const randomMillis = startMillis + Math.random() * (endMillis - startMillis);
  return new Date(randomMillis);
}
module.exports = {
  createQuotes: async function (lorem, customers, userId, orgId) {
    const today = new Date();

    const startDate = new Date(today);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 30);
    const quotes = [];
    const invoices = [];
    for (let i = 0; i < 1500; i++) {
      const customer =
        customers[Math.floor(Math.random() * customers.length)]._id;
      const items = [];
      const totalItems = Math.floor(Math.random() * 10);
      for (let k = 0; k < totalItems; k++) {
        items.push({
          name: lorem.generateWords(2),
          price: Math.floor(Math.random() * 1501),
          quantity: Math.floor(Math.random() * 100),
          um: ["nos", "kg", "m"][Math.floor(Math.random() * 4)],
          gst: "none",
        });
      }
      quotes.push({
        customer,
        items,
        total: items.reduce((sum, item) => item.price * item.quantity + sum, 0),
        totalTax: 0,
        description: lorem.generateWords(5),
        terms: lorem.generateSentences(3),
        date: getRandomDate(startDate, endDate),
        createdBy: userId,
        org: orgId,
        quoteNo: i,
        status: ["draft", "pending", "sent", "accepted", "declined"][
          Math.floor(Math.random() * 6)
        ],
      });
      invoices.push({
        customer,
        items,
        total: items.reduce((sum, item) => item.price * item.quantity + sum, 0),
        totalTax: 0,
        description: lorem.generateWords(5),
        terms: lorem.generateSentences(3),
        date: getRandomDate(startDate, endDate),
        createdBy: userId,
        org: orgId,
        invoiceNo: i+1,
        status: ["draft", "sent", "paid"][
          Math.floor(Math.random() * 4)
        ],
      });
    }
    await Quotes.insertMany(quotes);
    await Invoice.insertMany(invoices);
  },
};
