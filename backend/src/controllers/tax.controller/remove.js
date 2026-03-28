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
  if (setting) throw new Error(req.t("common:api.cannot_remove_default_tax"));
  const tax = await Tax.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });
  if (!tax) throw new TaxNotFound();
  if (tax.type === "single") {
    const taxLinked = await findSingleChildTaxPartOfGroup(req.params.id);
    if (taxLinked) throw new Error(req.t("common:api.tax_linked_to_grouped_tax"));
  }
  const billsLinked = [
    {
      Bill: Invoice,
      messageKey: "tax_linked_to_invoice",
    },
    {
      Bill: Quotes,
      messageKey: "tax_linked_to_invoice",
    },
    {
      Bill: Purchase,
      messageKey: "tax_linked_to_purchase",
    },
    {
      Bill: PurchaseOrder,
      messageKey: "tax_linked_to_purchase_order",
    },
    {
      Bill: ProformaInvoice,
      messageKey: "tax_linked_to_proforma_invoice",
    },
  ];
  for (const billLinked of billsLinked) {
    const bill = await findBillPartLinkedToTax(billLinked.Bill, req.params.id);
    if (bill) throw new Error(req.t(`common:api.${billLinked.messageKey}`));
  }
  await tax.deleteOne();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.taxes": -1 } }
  );
  return res.status(200).json({ message: req.t("common:api.tax_deleted") });
};

module.exports = remove;
