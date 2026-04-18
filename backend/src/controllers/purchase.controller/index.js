const getController = require("../bill.controller");
const Purchase = require("../../models/purchase.model");
const {
  PurchaseDuplicate,
  PurchaseNotFound,
} = require("../../errors/purchase.error");
const { purchaseDto } = require("../../dto/purchase.dto");
const payment = require("./payment");
const controller = getController({
  NotFound: PurchaseNotFound,
  Duplicate: PurchaseDuplicate,
  Bill: Purchase,
  dto: purchaseDto,
  relatedDocType: "purchases",
});

module.exports = {
  ...controller,
  payment,
};
