const { Schema, Types, model } = require("mongoose");
class Org {
  static findByIdAndUserId(userId, _id) {
    return this.findOne({ _id, createdBy: userId });
  }
}
const relatedDocsCountSchema = {
  type: Number,
  min: 0,
};
const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    address: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    panNo: {
      type: String,
    },
    telephone: {
      type: String,
    },
    email: {
      type: String,
    },
    web: {
      type: String,
    },
    bank: {
      name: {
        type: String,
        maxLength: 80,
      },
      accountHolderName: {
        type: String,
        maxLength: 80,
      },
      ifscCode: String,
      accountNo: Number,
      upi: String,
    },
    relatedDocsCount: {
      type: {
        contacts: relatedDocsCountSchema,
        invoices: relatedDocsCountSchema,
        expenses: relatedDocsCountSchema,
        expenseCategories: relatedDocsCountSchema,
        organizationUsers: relatedDocsCountSchema,
        parties: relatedDocsCountSchema,
        productCategories: relatedDocsCountSchema,
        products: relatedDocsCountSchema,
        proformaInvoices: relatedDocsCountSchema,
        purchaseOrders: relatedDocsCountSchema,
        purchases: relatedDocsCountSchema,
        quotes: relatedDocsCountSchema,
        saleOrders: relatedDocsCountSchema,
        creditNotes: relatedDocsCountSchema,
        debitNotes: relatedDocsCountSchema,
      },
      default: {
        contacts: 0,
        invoices: 0,
        expenses: 0,
        expenseCategories: 0,
        invoices: 0,
        organizationUsers: 0,
        parties: 0,
        productCategories: 0,
        products: 0,
        proformaInvoices: 0,
        purchaseOrders: 0,
        purchases: 0,
        quotes: 0,
        saleOrders: 0,
        creditNotes: 0,
        debitNotes: 0,
      },
    },
  },
  { timestamps: true, versionKey: false }
);
orgSchema.loadClass(Org);
const OrgModel = model("organization", orgSchema);

module.exports = OrgModel;
