const billService = require("../../services/bill.service");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const Quote = require("../../models/quotes.model");
const {
    InvoiceDuplicate,
    InvoiceNotFound,
} = require("../../errors/invoice.error");
const Invoice = require("../../models/invoice.model");
const { invoiceDto } = require("../../dto/invoice.dto");
const {
    PurchaseDuplicate,
    PurchaseNotFound,
} = require("../../errors/purchase.error");
const Purchase = require("../../models/purchase.model");
const { purchaseDto } = require("../../dto/purchase.dto");
const { getTaxListForOrg } = require("../../services/tax.service");
const { getUmListForOrg } = require("../../services/um.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const settingService = require("../../services/setting.service")
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const partyService = require("../../services/party.service");
const billTypes = require("../../constants/billTypes");
const {
    ProformaInvoiceDuplicate,
    ProformaInvoiceNotFound,
} = require("../../errors/proformaInvoice.error");
const proformaInvoiceDto = require("../../dto/proformaInvoice.dto");
const { PurchaseOrderNotFound, PurchaseOrderDuplicate } = require("../../errors/purchaseOrder.error");
const { QuoteNotFound, QuotationDuplicate } = require("../../errors/quote.error");
const Quotes = require("../../models/quotes.model");
const { quoteDto } = require("../../dto/quotes.dto");
const models = {
    invoices: {
        Bill: Invoice,
        dto: invoiceDto,
        Duplicate: InvoiceDuplicate,
        NotFound: InvoiceNotFound,
        prefixType: "invoice",
        relatedDocType: "invoices",
    },
    purchases: {
        Bill: Purchase,
        dto: purchaseDto,
        Duplicate: PurchaseDuplicate,
        NotFound: PurchaseNotFound,
        relatedDocType: "purchases",
    },
    proformaInvoices: {
        Bill: ProformaInvoice,
        dto: proformaInvoiceDto,
        Duplicate: ProformaInvoiceDuplicate,
        prefixType: "proformaInvoice",
        relatedDocType: "proformaInvoices",
    },
    purchaseOrders: {
        prefixType: "purchaseOrder",
        relatedDocType: "purchaseOrders",
        Bill: PurchaseOrder,
        Duplicate: PurchaseOrderDuplicate,
        NotFound: PurchaseOrderNotFound
    },
    estimates: {
        NotFound: QuoteNotFound,
        Duplicate: QuotationDuplicate,
        Bill: Quotes,
        dto: quoteDto,
        prefixType: "quotation",
        relatedDocType: "quotes",
    },
    quotations: {
        NotFound: QuoteNotFound,
        Duplicate: QuotationDuplicate,
        Bill: Quotes,
        dto: quoteDto,
        prefixType: "quotation",
        relatedDocType: "quotes",
    },
}
const upsertBill = async (params) => {
    try {
        const makeRequestBody = async () => {
            logger.info("Bill details ", params)
            
            logger.info(`Executing ${params?.billId ? "Edit" : "Create"} flow`)
            const party = await partyService.upsert(params);
            const setting = params?.sequence || await settingService.getDetailedSettingForOrg(params.org);
            const items = [];
            const ums = await getUmListForOrg(params.org);
            const taxes = await getTaxListForOrg(params.org);
            const sequence = await billService.getNextSequence({
                Bill,
                org: params.org,
            });
            params.items.forEach(item => {
                const tax = setting?.receiptDefaults?.tax?._id?.toString();
                const storedUm = ums.find(um => {
                    const searchTerm = item?.um?.toLowerCase();
                    if (!searchTerm) return false;

                    return um.name.toLowerCase().includes(searchTerm) ||
                        um.unit.toLowerCase().includes(searchTerm);
                });
                const um = storedUm ? storedUm?._id?.toString() : setting?.receiptDefaults?.um?._id?.toString();
                items.push({
                    name: item.name,
                    price: item.price,
                    quantity: item?.quantity || 1,
                    code: item?.code,
                    um,
                    tax
                });
            });
            return {
                party: params.partyId,
                billingAddress: party.billingAddress,
                items,
                date: params.date,
                prefix: setting?.transactionPrefix?.invoice || "",
                org: params.org,
                sequence,
                createdBy: params.createdBy
            };
        };
        const modelProps = models[params.type];
        const { Bill } = modelProps;
        if (!Bill) throw new Error("Invalid bill type");
        const requestBody = await makeRequestBody();
        logger.info("Bill Body " + JSON.stringify(requestBody));
        const bill = await executeMongoDbTransaction(async (session) => {
            const bill = await billService.saveBill({
                ...modelProps,
                billId: params?.billId,
                requestBody,
                session,
            });
            await OrgModel.updateOne(
                { _id: params.org },
                { $inc: { [modelProps.relatedDocType]: 1 } }
            ).session(session);
            logger.info(`${Bill.modelName} created ${bill.id}`);
            return bill;
        });
        logger.info("Bill created");
        const billLabel = billTypes[Bill.modelName] || Bill.modelName;
        return bill;
    } catch (error) {
        throw error;
    }
};
const billHandler = {
    find_bill: async (params) => {
        const modelProps = models[params.type];
        const { Bill } = modelProps;
        if (!Bill) throw new Error("Invalid bill type");
        const filter = { org: params.org };
        if (params.billId) filter._id = params.billId;
        if (params.billNumber) filter.num = params.billNumber;
        return billService.getBill({ Bill, filter });
    },
    create_bill: upsertBill,
    update_bill: upsertBill,
}

module.exports = billHandler;