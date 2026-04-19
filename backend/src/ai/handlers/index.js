const partyHandler = require("./party.handler");
const billHandler = require("./bill.handler");
const productHandlers = require("./product.handler");
const getHandler = (handlerName) => {
    const handlers = {  ...billHandler,...partyHandler, ...productHandlers };
    return handlers[handlerName];
}
module.exports = getHandler;