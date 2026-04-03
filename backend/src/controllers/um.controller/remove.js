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
  if (setting) throw new Error(req.t("common:api.cannot_remove_default_unit"));
  const product = await Product.findOne({
    um: umId,
    org: req.params.orgId,
  });
  if (product) throw new Error(req.t("common:api.unit_linked_to_product"));
  const billsLinked = [
    {
      Bill: Invoice,
      messageKey: "unit_linked_to_invoice",
    },
    {
      Bill: Quotes,
      messageKey: "unit_linked_to_invoice",
    },
    {
      Bill: Purchase,
      messageKey: "unit_linked_to_purchase",
    },
    {
      Bill: PurchaseOrder,
      messageKey: "unit_linked_to_purchase_order",
    },
    {
      Bill: ProformaInvoice,
      messageKey: "unit_linked_to_proforma_invoice",
    },
  ];
  for (const { Bill, messageKey } of billsLinked) {
    const bill = await findBillWithUm(Bill, umId);
    if (bill) throw new Error(req.t(`common:api.${messageKey}`));
  }
  const um = await Um.softDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!um) throw new Error(req.t("common:api.unit_not_found"));
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.ums": -1 } }
  );
  invalidateUmCache(req.params.orgId);
  return res.status(200).json({ message: req.t("common:api.unit_deleted") });
};

module.exports = remove;
