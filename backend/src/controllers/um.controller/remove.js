const Invoice = require("../../models/invoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Purchase = require("../../models/purchase.model");
const Quotes = require("../../models/quotes.model");
const Um = require("../../models/um.model");
const Product = require("../../models/product.model");
const Setting = require("../../models/settings.model");
const OrgModel = require("../../models/org.model");

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
  if (setting) throw new Error("Cannot remove default unit");
  const product = await Product.findOne({
    um: umId,
    org: req.params.orgId,
  });
  if (product) throw new Error("Unit linked to product");
  const billsLinked = [
    {
      Bill: Invoice,
      message: "Unit linked to invoice",
    },
    {
      Bill: Quotes,
      message: "Unit linked to invoice",
    },
    {
      Bill: Purchase,
      message: "Unit linked to purchase",
    },
    {
      Bill: PurchaseOrder,
      message: "Unit linked to purchase order",
    },
    {
      Bill: ProformaInvoice,
      message: "Unit linked to proforma invoice",
    },
  ];
  for (const { Bill, message } of billsLinked) {
    const bill = await findBillWithUm(Bill, umId);
    if (bill) throw new Error(message);
  }
  const um = await Um.softDelete({
    _id: req.params.id,
    org: req.params.orgId,
  });
  if (!um) throw new Error("Unit not found");
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.ums": -1 } }
  );
  return res.status(200).json({ message: "Unit deleted" });
};

module.exports = remove;
