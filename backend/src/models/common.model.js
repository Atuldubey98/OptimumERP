const { Types, Schema } = require("mongoose");

const billItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    code: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    um: {
      type: Types.ObjectId,
      ref: "ums",
      required: true,
    },
    tax: {
      type: Types.ObjectId,
      ref: "taxes",
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "product",
    },
  }
);



const taxCategoriesValidator = {
  validator: function (value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    return Object.values(value).every(
      (taxValue) =>
        typeof taxValue === "number" &&
        Number.isFinite(taxValue) &&
        taxValue >= 0
    );
  },
  message: () =>
    "taxCategories must be an object with numeric percentage values between 0 and 100",
};

const financialYearSchema = new Schema(
  {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const baseBillFields = {
  party: {
    type: Types.ObjectId,
    required: true,
    ref: "party",
  },
  billingAddress: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
    required: true,
  },
  totalTax: {
    type: Number,
    default: 0,
    required: true,
  },
  shippingCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxCategories: {
    type: Object,
    default: {},
    validate: taxCategoriesValidator,
  },
  description: {
    type: String,
    default: "Thanks for the business.",
  },
  terms: {
    type: String,
  },
  org: {
    type: Types.ObjectId,
    required: true,
    ref: "organization",
  },
  items: [billItemSchema],
  date: {
    type: Date,
    default: () => new Date(),
  },
  num: {
    type: String,
    default: "",
  },
  sequence: {
    type: Number,
  },
  prefix: {
    type: String,
    default: "",
  },
  createdBy: {
    type: Types.ObjectId,
    required: true,
    ref: "user",
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: "user",
  },
  financialYear: {
    type: financialYearSchema,
    required: true,
  },
};

module.exports = {
  billItemSchema,
  taxCategoriesValidator,
  financialYearSchema,
  baseBillFields,
};
