const partyTools = require("./party.tool");

const billTools = require("./bill.tool");
const productTools = require("./product.tool");
const contactTools = require("./contact.tool");
const paymentVoucherTools = require("./paymentVoucher.tool");
const tools = [...partyTools, ...billTools, ...productTools, ...contactTools, ...paymentVoucherTools];
module.exports = tools;
