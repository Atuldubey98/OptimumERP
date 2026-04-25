const partyHandler = require("./party.handler");
const billHandler = require("./bill.handler");
const productHandlers = require("./product.handler");
const contactHandlers = require("./contact.handler");
const paymentVoucherHandler = require("./paymentVoucher.handler");
const expenseHandlers = require("./expense.handler");
const getHandler = (handlerName) => {
  const handlers = {
    ...billHandler,
    ...partyHandler,
    ...productHandlers,
    ...contactHandlers,
    ...paymentVoucherHandler,
    ...expenseHandlers,
  };
  return handlers[handlerName];
};
module.exports = getHandler;
