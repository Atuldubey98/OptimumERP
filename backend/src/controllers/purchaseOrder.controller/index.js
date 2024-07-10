const {
  PurchaseOrderDuplicate,
  PurchaseOrderNotFound,
} = require("../../errors/purchaseOrder.error");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const { purchaseOrderDto } = require("../../dto/purchaseOrder.dto");
const nextSequence = require("./nextSequence");
const getController = require("../bill.controller");
const controller = getController({
  NotFound: PurchaseOrderNotFound,
  Duplicate: PurchaseOrderDuplicate,
  Bill: PurchaseOrder,
  dto: purchaseOrderDto,
  prefixType: "purchaseOrder",
  relatedDocType: "purchaseOrders",
});
module.exports = {
  ...controller,
  nextSequence,
};
