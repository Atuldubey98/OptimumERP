const RecurringInvoice = require("../models/recurringInvoice.model");
const OrgModel = require("../models/org.model");
const { executeMongoDbTransaction, getPaginationParams } = require("./crud.service");
const { RECURRING_INVOICES } = require("../constants/entities");
const logger = require("../logger");
const { calculateTaxes } = require("./taxCalculator.service");
const { getDisplaySettingForOrg } = require("./setting.service");
const { saveBill, getNextSequence } = require("./bill.service");
const Invoice = require("../models/invoice.model");
const { invoiceDto } = require("../dto/invoice.dto");
const { InvoiceDuplicate, InvoiceNotFound } = require("../errors/invoice.error");
const ProformaInvoice = require("../models/proformaInvoice.model");
const proformaInvoiceDto = require("../dto/proformaInvoice.dto");
const { ProformaInvoiceDuplicate, ProformaInvoiceNotFound } = require("../errors/proformaInvoice.error");
const notificationService = require("./notification.service");

exports.create = async (body, session = null) => {
    const operations = async (session) => {
        const [totalWithTaxes, setting] = await Promise.all([
            calculateTaxes(body.items, body.org),
            getDisplaySettingForOrg(body.org)
        ]);

        const nextOccurrence = body.nextOccurrence || exports.getFirstOccurrence(
            body.startDate,
            body.interval,
            body.dateOfEveryMonth,
            body.dayOfEveryWeek
        );

        const recurringInvoice = new RecurringInvoice({
            ...body,
            ...totalWithTaxes,
            financialYear: setting.financialYear,
            nextOccurrence
        });
        await recurringInvoice.save({ session });
        return recurringInvoice;
    };

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
};

const CONFIG_MAP = {
    proformaInvoice: {
        Model: ProformaInvoice,
        dto: proformaInvoiceDto,
        Duplicate: ProformaInvoiceDuplicate,
        NotFound: ProformaInvoiceNotFound,
        updateField: "proformaInvoices",
        orgCountField: "relatedDocsCount.proformaInvoices",
        notifTitle: "Recurring Proforma Invoice Generated",
        notifLink: "receipt/proformaInvoices/",
        prefixKey: "proformaInvoice"
    },
    invoice: {
        Model: Invoice,
        dto: invoiceDto,
        Duplicate: InvoiceDuplicate,
        NotFound: InvoiceNotFound,
        updateField: "invoices",
        orgCountField: "relatedDocsCount.invoices",
        notifTitle: "Recurring Invoice Generated",
        notifLink: "receipt/invoices/",
        prefixKey: "invoice"
    }
};

const generateBill = async (recurringInvoice, type, session = null) => {
    const config = { ...CONFIG_MAP[type], prefixType: type };
    const isProforma = type === "proformaInvoice";

    const operations = async (session) => {
        const setting = await getDisplaySettingForOrg(recurringInvoice.org);
        const sequence = await getNextSequence({
            Bill: config.Model,
            org: recurringInvoice.org,
            prefixType: config.prefixType,
            session,
        });

        const requestBody = {
            org: String(recurringInvoice.org),
            party: String(recurringInvoice.party?._id || recurringInvoice.party),
            date: recurringInvoice.nextOccurrence || recurringInvoice.startDate,
            sequence,
            prefix: setting.transactionPrefix?.[config.prefixKey] || "",
            poNo: recurringInvoice.poNo,
            poDate: recurringInvoice.poDate ? recurringInvoice.poDate.toISOString() : "",
            status: "draft",
            items: recurringInvoice.items.map((item) => {
                const itemObj = item.toObject ? item.toObject() : item;
                const { _id, ...cleanItem } = itemObj;
                return {
                    ...cleanItem,
                    um: String(cleanItem.um?._id || cleanItem.um),
                    tax: String(cleanItem.tax?._id || cleanItem.tax),
                    product: String(cleanItem.product?._id || cleanItem.product),
                };
            }),
            createdBy: String(recurringInvoice.createdBy?._id || recurringInvoice.createdBy),
            terms: recurringInvoice.terms || "Thanks for business !",
            description: recurringInvoice.description || "",
            billingAddress: recurringInvoice.billingAddress,
            shippingCharges: recurringInvoice.shippingCharges,
        };

        const bill = await saveBill({
            Bill: config.Model,
            dto: config.dto,
            Duplicate: config.Duplicate,
            NotFound: config.NotFound,
            requestBody,
            prefixType: config.prefixType,
            user: recurringInvoice.createdBy,
            session,
        });

        await RecurringInvoice.updateOne(
            { _id: recurringInvoice._id },
            {
                $push: { [config.updateField]: bill._id },
                $inc: { totalGenerated: 1 },
                $set: { lastGeneratedDate: new Date() }
            },
            { session }
        );

        await OrgModel.updateOne(
            { _id: recurringInvoice.org },
            { $inc: { [config.orgCountField]: 1 } },
            { session }
        );

        await notificationService.create({
            user: recurringInvoice.createdBy?._id || recurringInvoice.createdBy,
            org: recurringInvoice.org,
            title: config.notifTitle,
            message: `${isProforma ? "Proforma " : ""}Invoice #${bill.prefix}${bill.sequence} generated for date ${new Date(requestBody.date).toLocaleDateString()}`,
            type: "success",
            data: { event: "link_to", data: `${config.notifLink}${bill._id}` }
        }, session);

        return bill;
    };

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
};

exports.generateInvoice = (ri, session) => generateBill(ri, "invoice", session);
exports.generateProformaInvoice = (ri, session) => generateBill(ri, "proformaInvoice", session);

exports.checkIfInvoiceHasToBeGenerated = (recurringInvoice) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = recurringInvoice.nextOccurrence || recurringInvoice.startDate;
    if (!nextDate) return false;

    const nextOccurrence = new Date(nextDate);
    nextOccurrence.setHours(0, 0, 0, 0);

    const endDate = new Date(recurringInvoice.endDate);
    endDate.setHours(23, 59, 59, 999);

    const hasFlags = recurringInvoice.generateInvoice || recurringInvoice.generateProformaInvoice;

    return recurringInvoice.status === "active" &&
        nextOccurrence <= today &&
        nextOccurrence <= endDate &&
        hasFlags;
};

exports.convertToInvoice = async (recurringInvoice, session = null) => {
    const results = {};
    if (recurringInvoice.generateInvoice) {
        results.invoice = await exports.generateInvoice(recurringInvoice, session);
    }
    if (recurringInvoice.generateProformaInvoice) {
        results.proformaInvoice = await exports.generateProformaInvoice(recurringInvoice, session);
    }
    return results;
};

exports.updateNextOccurrence = async (recurringInvoice, session = null) => {
    const baseDate = recurringInvoice.nextOccurrence || recurringInvoice.startDate;
    const nextOccurrence = exports.calculateNextOccurrence(baseDate, recurringInvoice.interval);

    await RecurringInvoice.updateOne(
        { _id: recurringInvoice._id },
        { $set: { nextOccurrence } },
        { session }
    );
    return nextOccurrence;
};

exports.calculateNextOccurrence = (currentNext, interval) => {
    const date = new Date(currentNext);
    switch (interval) {
        case "daily": date.setDate(date.getDate() + 1); break;
        case "weekly": date.setDate(date.getDate() + 7); break;
        case "monthly": date.setMonth(date.getMonth() + 1); break;
        case "quarterly": date.setMonth(date.getMonth() + 3); break;
        case "triannually": date.setMonth(date.getMonth() + 4); break;
        case "semiannually":
        case "half_yearly": date.setMonth(date.getMonth() + 6); break;
        case "yearly": date.setFullYear(date.getFullYear() + 1); break;
    }
    return date;
};

exports.getFirstOccurrence = (start, interval, dateOfEveryMonth, dayOfEveryWeek) => {
    const current = new Date(start);
    if (interval === "weekly" && dayOfEveryWeek) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const targetDay = days.indexOf(dayOfEveryWeek.toLowerCase());
        const currentDay = current.getDay();
        if (currentDay > targetDay) {
            current.setDate(current.getDate() + (7 - currentDay + targetDay));
        } else {
            current.setDate(current.getDate() + (targetDay - currentDay));
        }
    }
    if (["monthly", "quarterly", "triannually", "semiannually", "half_yearly", "yearly"].includes(interval) && dateOfEveryMonth) {
        current.setDate(dateOfEveryMonth);
        if (current < start) {
            current.setMonth(current.getMonth() + 1);
            current.setDate(dateOfEveryMonth);
        }
    }
    return current;
};

exports.paginate = async ({ query, params }) => {
    const { filter, limit, page, skip, total, totalPages, hasTextSearch } =
        await getPaginationParams({
            query,
            params,
            model: RecurringInvoice,
            modelName: RECURRING_INVOICES,
        });

    let mongoQuery = RecurringInvoice.find(filter);

    if (hasTextSearch) {
        mongoQuery = mongoQuery
            .select({ score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } });
    } else {
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const data = await mongoQuery
        .skip(skip)
        .limit(limit)
        .populate("party", "name")
        .lean()
        .exec();

    return {
        data,
        page,
        limit,
        total,
        totalPages,
    };
};

exports.findOne = async (filter) => {
    return await RecurringInvoice.findOne(filter)
        .populate("party")
        .populate("createdBy", "name email")
        .populate("invoices", "num date total totalTax status")
        .populate("proformaInvoices", "num date total totalTax status")
        .populate("items.tax")
        .populate("items.um")
        .lean();
};

exports.update = async (filter, body) => {
    const operations = async (session) => {
        const [totalWithTaxes, setting] = await Promise.all([
            calculateTaxes(body.items, filter.org),
            getDisplaySettingForOrg(filter.org)
        ]);

        const updatedBody = {
            ...body,
            ...totalWithTaxes,
            financialYear: setting.financialYear
        };

        const recurringInvoice = await RecurringInvoice.findOneAndUpdate(
            filter,
            updatedBody,
            { new: true, session }
        );
        return recurringInvoice;
    };

    return await executeMongoDbTransaction(operations);
};

exports.remove = async (filter) => {
    return await RecurringInvoice.findOneAndDelete(filter);
};