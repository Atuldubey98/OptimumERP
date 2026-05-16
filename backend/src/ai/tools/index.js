const partyTools = require("./party.tool");

const billTools = require("./bill.tool");
const productTools = require("./product.tool");
const contactTools = require("./contact.tool");
const paymentVoucherTools = require("./paymentVoucher.tool");
const expenseTools = require("./expense.tool");
const reportTools = require("./report.tool");
const dashboardTools = require("./dashboard.tool");
const tools = [...partyTools, ...billTools, ...productTools, ...contactTools, ...paymentVoucherTools, ...expenseTools, ...reportTools, ...dashboardTools];
module.exports = tools;
