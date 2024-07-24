const { Schema, Types, model } = require("mongoose");

const taxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    org: {
      type: Types.ObjectId,
      ref: "organization",
      required: true,
    },
    description: {
      type: String,
      maxLength: 80,
    },
    type: {
      type: String,
      enum: ["single", "grouped"],
      default: "single",
      required: true,
    },
    category: {
      type: String,
      enum: ["igst", "sgst", "cgst", "vat", "cess", "sal", "none", "others"],
      required: true,
    },
    children: {
      type: [
        {
          type: Types.ObjectId,
          required: true,
          ref: "taxes",
        },
      ],
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      max: 100,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    collection: "taxes",
  }
);

const Tax = model("taxes", taxSchema);
taxSchema.index({
  name: "text",
});
module.exports = Tax;
