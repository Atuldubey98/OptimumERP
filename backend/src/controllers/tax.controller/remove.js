const {
  TaxNotFound,
  CannotRemoveDefaultTax,
  TaxLinkedToGroupedTax,
  TaxLinkedToInvoice,
  TaxLinkedToPurchase,
  TaxLinkedToPurchaseOrder,
  TaxLinkedToProformaInvoice,
} = require("../../errors/tax.error");
const Tax = require("../../models/tax.model");
const Invoice = require("../../models/invoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const Purchase = require("../../models/purchase.model");
const Quotes = require("../../models/quotes.model");
const Setting = require("../../models/settings.model");
const OrgModel = require("../../models/org.model");
const { invalidateTaxCache } = require("../../services/tax.service");
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
  if (setting) throw new CannotRemoveDefaultTax();
  const tax = await Tax.findOne({
    org: req.params.orgId,
    _id: req.params.id,
  });
  if (!tax) throw new TaxNotFound();
  if (tax.type === "single") {
    const taxLinked = await findSingleChildTaxPartOfGroup(req.params.id);
    if (taxLinked) throw new TaxLinkedToGroupedTax();
  }
  const billsLinked = [
    { Bill: Invoice, ErrorClass: TaxLinkedToInvoice },
    { Bill: Quotes, ErrorClass: TaxLinkedToInvoice },
    { Bill: Purchase, ErrorClass: TaxLinkedToPurchase },
    { Bill: PurchaseOrder, ErrorClass: TaxLinkedToPurchaseOrder },
    { Bill: ProformaInvoice, ErrorClass: TaxLinkedToProformaInvoice },
  ];
  for (const billLinked of billsLinked) {
    const bill = await findBillPartLinkedToTax(billLinked.Bill, req.params.id);
    if (bill) throw new billLinked.ErrorClass();
  }
  await tax.deleteOne();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.taxes": -1 } }
  );
  invalidateTaxCache(req.params.orgId);
  return res.status(200).json({ message: req.t("common:api.tax_deleted") });
};

module.exports = remove;
