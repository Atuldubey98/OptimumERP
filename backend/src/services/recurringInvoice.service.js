const RecurringInvoice = require("../models/recurringInvoice.model");
const OrgModel = require("../models/org.model");
const { executeMongoDbTransaction, getPaginationParams } = require("./crud.service");
const logger = require("../logger");
const { RECURRING_INVOICES } = require("../constants/entities");
const { saveBill, getNextSequence } = require("./bill.service");
const Invoice = require("../models/invoice.model");
const ProformaInvoice = require("../models/proformaInvoice.model");
const { invoiceDto } = require("../dto/invoice.dto");
const proformaInvoiceDto = require("../dto/proformaInvoice.dto");
const { InvoiceDuplicate, InvoiceNotFound } = require("../errors/invoice.error");
const { ProformaInvoiceDuplicate, ProformaInvoiceNotFound } = require("../errors/proformaInvoice.error");
const { RecurringInvoiceNotFound } = require("../errors/recurringInvoice.error");
const { calculateTaxes } = require("./taxCalculator.service");
const { getDisplaySettingForOrg } = require("./setting.service");



exports.create = async (body, session = null) => {
    const operations = async (session) => {
        const totalWithTaxes = await calculateTaxes(body.items, body.org);
        const setting = await getDisplaySettingForOrg(body.org);
        const org = await OrgModel.findById(body.org).session(session).lean();

        const recurringInvoice = new RecurringInvoice({
            ...body,
            ...totalWithTaxes,
            financialYear: setting.financialYear,
        });
        await recurringInvoice.save({ session });
        await OrgModel.updateOne(
            { _id: recurringInvoice.org },
            { $inc: { "relatedDocsCount.recurringInvoices": 1 } },
            { session }
        );
        logger.info(`Created recurring invoice ${recurringInvoice.id}`);
        return recurringInvoice;
    };

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
};

exports.update = async (filter, body, session = null) => {
    const operations = async (session) => {
        let updateBody = { ...body };
        const existingRI = await RecurringInvoice.findOne(filter).session(session).lean();
        if (!existingRI) return null;

        if (body.items) {
            const orgId = filter.org || body.org || existingRI.org;
            const totalWithTaxes = await calculateTaxes(body.items, orgId);
            updateBody = { ...updateBody, ...totalWithTaxes };
        }


        const recurringInvoice = await RecurringInvoice.findOneAndUpdate(
            filter,
            { $set: updateBody },
            { new: true, session }
        );
        if (recurringInvoice) {
            logger.info(`Updated recurring invoice ${recurringInvoice.id}`);
        }
        return recurringInvoice;
    };

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
};

exports.findOne = async (filter, select = null) => {
    return await RecurringInvoice.findOne(filter).populate("party").populate("items.tax")
        .populate("items.um").select(select).lean().exec();
};

exports.remove = async (filter, session = null) => {
    const operations = async (session) => {
        const recurringInvoice = await RecurringInvoice.softDelete(filter, { session });
        if (recurringInvoice) {
            await OrgModel.updateOne(
                { _id: recurringInvoice.org },
                { $inc: { "relatedDocsCount.recurringInvoices": -1 } },
                { session }
            );
            logger.info(`Soft deleted recurring invoice ${recurringInvoice.id}`);
        }
        return recurringInvoice;
    };

    if (session) return await operations(session);
    return await executeMongoDbTransaction(operations);
};

exports.paginate = async ({ query, params }) => {
    const { filter, page, limit, skip, total, totalPages } = await getPaginationParams({
        query,
        params,
        model: RecurringInvoice,
        modelName: RECURRING_INVOICES,
    });

    const recurringInvoices = await RecurringInvoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("party", "name")
        .lean()
        .exec();

    return {
        data: recurringInvoices,
        page,
        limit,
        total,
        totalPages,
    };
};