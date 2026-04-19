const partyTools = require("./party.tool");

const billTools = require("./bill.tool");
const productTools = require("./product.tool");

const tools = [...partyTools, ...billTools, ...productTools];
module.exports = tools;