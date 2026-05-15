const { Schema, Types, model } = require("mongoose");
const { baseBillFields } = require("./common.model");

const recurringInvoiceSchema = new Schema(
    {
        ...baseBillFields,
        poNo: {
            type: String,
            default: "",
        },
        poDate: {
            type: Date,
        },
        status: {
            type: String,
            default: "active",
            enum: ["paused", "active", "cancelled"],
            required: true,
        },
        interval: {
            enum: ["weekly", "monthly", "yearly", "quarterly", "triannually", "semiannually", "half_yearly", "daily"],
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        nextOccurrence: {
            type: Date,
            required: true
        },
        lastGeneratedDate: {
            type: Date,
        },
        dateOfEveryMonth: {
            type: Number,
        },
        dayOfEveryWeek: {
            type: String,
            enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        },
        generateInvoice: {
            type: Boolean,
            required: true,
            default: true
        },
        generateProformaInvoice: {
            type: Boolean,
            required: true,
            default: false
        },
        invoices: {
            type: [{
                type: Types.ObjectId,
                ref: "invoice",
            }],
            default: [],
        },
        proformaInvoices: {
            type: [{
                type: Types.ObjectId,
                ref: "proforma_invoice",
            }],
            default: [],
        },
        totalGenerated: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true, versionKey: false }
);

const RecurringInvoice = model("recurring_invoice", recurringInvoiceSchema);

module.exports = RecurringInvoice;  