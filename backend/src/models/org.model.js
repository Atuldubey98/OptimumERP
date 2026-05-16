const { Schema, Types, model } = require("mongoose");
class Org {
  static findByIdAndUserId(userId, _id) {
    return this.findOne({ _id, createdBy: userId });
  }
}
const relatedDocsCountFields = [
  "contacts",
  "invoices",
  "expenses",
  "expenseCategories",
  "organizationUsers",
  "parties",
  "productCategories",
  "products",
  "proformaInvoices",
  "purchaseOrders",
  "purchases",
  "quotes",
  "saleOrders",
  "paymentVouchers",
  "recurringInvoices",
  "ums",
  "taxes",
];

const relatedDocsCountSchema = {};
relatedDocsCountFields.forEach((field) => {
  relatedDocsCountSchema[field] = {
    type: Number,
    min: 0,
    default: 0,
  };
});

const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    alias: {
      type: String,
      required: true,
      maxLength: 80,
    },
    address: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
    },
    timezone: {
      type: String,
      required: true,
    },
    location: {
      countryCode3: String,
      stateCode: String,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    logo: {
      type: String,
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
      _id: false,
      type: relatedDocsCountSchema,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false }
);
orgSchema.loadClass(Org);
const OrgModel = model("organization", orgSchema);

module.exports = OrgModel;
