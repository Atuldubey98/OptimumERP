const { TaxNotFound } = require("../../errors/tax.error");
const Tax = require("../../models/tax.model");
const Invoice = require("../../models/invoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Purchase = require("../../models/purchase.model");
const Quotes = require("../../models/quotes.model");
const Setting = require("../../models/settings.model");
const OrgModel = require("../../models/org.model");
const findSingleChildTaxPartOfGroup = async (taxId) => {
  return Tax.findOne({
    type: "grouped",
    children: taxId,
  });
};
const findBillPartLinkedToTax = async (Bill, taxId) => {
  return Bill.findOne({
    "items.tax": taxId,
  });
};
const remove = async (req, res) => {
  const setting = await Setting.findOne({
    org: req.params.orgId,
    "receiptDefaults.tax": req.params.id,
  }).lean();
  if (setting) throw new Error("Cannot remove default tax");
  const tax = await Tax.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });
  if (!tax) throw new TaxNotFound();
  if (tax.type === "single") {
    const taxLinked = await findSingleChildTaxPartOfGroup(req.params.id);
    if (taxLinked) throw new Error("Tax linked to grouped tax");
  }
  const billsLinked = [
    {
      Bill: Invoice,
      message: "Tax linked to invoice",
    },
    {
      Bill: Quotes,
      message: "Tax linked to invoice",
    },
    {
      Bill: Purchase,
      message: "Tax linked to purchase",
    },
    {
      Bill: PurchaseOrder,
      message: "Tax linked to purchase order",
    },
    {
      Bill: ProformaInvoice,
      message: "Tax linked to proforma invoice",
    },
  ];
  for (const billLinked of billsLinked) {
    const bill = await findBillPartLinkedToTax(billLinked.Bill, req.params.id);
    if (bill) throw new Error(billLinked.message);
  }
  await tax.deleteOne();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.taxes": -1 } }
  );
  return res.status(200).json({ message: "Tax deleted" });
};

module.exports = remove;
