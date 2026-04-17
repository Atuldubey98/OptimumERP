const partyTools = require("./party.tool");

const billTools = require("./bill.tool");

const tools = [...partyTools, ...billTools];
module.exports = tools;