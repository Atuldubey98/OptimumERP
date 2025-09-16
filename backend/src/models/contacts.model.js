const { Schema, Types, model } = require("mongoose");
const Party = require("./party.model");
const Property = require("./properties.model");

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
      validate: {
        validator: async (value) => {
          if (!value) return true;
          const party = await Party.findById(value);
          return party !== null;
        },
        message: "Party not found",
      },
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
      validate: {
        validator : async (value)=>{
          const property = await Property.findOne({name : "CONTACT_TYPES", "value.value": value}).lean();
          return property != null;
        },
        message : "Invalid contact type"
      }
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
