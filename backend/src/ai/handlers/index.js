const partyHandler = require("./party.handler");
const billHandler = require("./bill.handler");
const productHandlers = require("./product.handler");
const contactHandlers = require("./contact.handler");
const getHandler = (handlerName) => {
  const handlers = {
    ...billHandler,
    ...partyHandler,
    ...productHandlers,
    ...contactHandlers,
  };
  return handlers[handlerName];
};
module.exports = getHandler;
