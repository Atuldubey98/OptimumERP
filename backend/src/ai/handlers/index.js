const partyHandler = require("./party.handler");
const getHandler = (handlerName) => {
    const handlers = { ...partyHandler }
    return handlers[handlerName];
}
module.exports = getHandler;