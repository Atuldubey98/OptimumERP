const { Schema, Types, model } = require("mongoose");
const contactTypes = require("../constants/contactType");

const contactSchema = new Schema(
  {
    org: {
      type: Types.ObjectId,
      required: true,
      ref: "organization",
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    email: {
      type: String,
    },
    party: {
      type: Types.ObjectId,
      ref: "party",
    },
    telephone: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: contactTypes.map((contact) => contact.value),
    },
    updatedBy: {
      type: String,
      ref: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactSchema.index({
  name: "text",
  type: "text",
});
const Contact = model("contact", contactSchema);

module.exports = Contact;
