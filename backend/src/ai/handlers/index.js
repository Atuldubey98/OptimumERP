const partyHandler = require("./party.handler");
const billHandler = require("./bill.handler");
const productHandlers = require("./product.handler");
const contactHandlers = require("./contact.handler");
const paymentVoucherHandler = require("./paymentVoucher.handler");
const expenseHandlers = require("./expense.handler");
const reportHandlers = require("./report.handler");
const dashboardHandlers = require("./dashboard.handler");
const smtpHandler = require("./smtp.handler");
const salesForecastHandler = require("./salesForecast.handler");
const handlers = {
  ...billHandler,
  ...partyHandler,
  ...productHandlers,
  ...contactHandlers,
  ...paymentVoucherHandler,
  ...expenseHandlers,
  ...reportHandlers,
  ...dashboardHandlers,
  ...smtpHandler,
  ...salesForecastHandler,
};
const getHandler = (handlerName) => handlers[handlerName];

module.exports = getHandler;
