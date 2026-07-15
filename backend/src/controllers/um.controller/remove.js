const Invoice = require("../../models/invoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Purchase = require("../../models/purchase.model");
const Quotes = require("../../models/quotes.model");
const Um = require("../../models/um.model");
const Product = require("../../models/product.model");
const Setting = require("../../models/settings.model");
const OrgModel = require("../../models/org.model");
const { invalidateUmCache } = require("../../services/um.service");
const {
  UmNotFound,
  CannotRemoveDefaultUnit,
  UnitLinkedToProduct,
  UnitLinkedToInvoice,
  UnitLinkedToPurchase,
  UnitLinkedToPurchaseOrder,
  UnitLinkedToProformaInvoice,
} = require("../../errors/um.error");

const findBillWithUm = async (Bill, umId) => {
  return Bill.findOne({
    "items.um": umId,
  });
};
const remove = async (req, res) => {
  const umId = req.params.id;
  const setting = await Setting.findOne({
    org: req.params.orgId,
    "receiptDefaults.um": umId,
  }).lean();
  if (setting) throw new CannotRemoveDefaultUnit();
  const product = await Product.findOne({
    um: umId,
    org: req.params.orgId,
  });
  if (product) throw new UnitLinkedToProduct();
  const billsLinked = [
    { Bill: Invoice, ErrorClass: UnitLinkedToInvoice },
    { Bill: Quotes, ErrorClass: UnitLinkedToInvoice },
    { Bill: Purchase, ErrorClass: UnitLinkedToPurchase },
    { Bill: PurchaseOrder, ErrorClass: UnitLinkedToPurchaseOrder },
    { Bill: ProformaInvoice, ErrorClass: UnitLinkedToProformaInvoice },
  ];
  for (const { Bill, ErrorClass } of billsLinked) {
    const bill = await findBillWithUm(Bill, umId);
    if (bill) throw new ErrorClass();
  }
  const um = await Um.softDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!um) throw new UmNotFound();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.ums": -1 } }
  );
  invalidateUmCache(req.params.orgId);
  return res.status(200).json({ message: req.t("common:api.unit_deleted") });
};

module.exports = remove;

