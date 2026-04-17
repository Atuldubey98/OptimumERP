const partyHandler = require("./party.handler");
const billHandler = require("./bill.handler");
const getHandler = (handlerName) => {
    const handlers = {  ...billHandler,...partyHandler,  };
    return handlers[handlerName];
}
module.exports = getHandler;