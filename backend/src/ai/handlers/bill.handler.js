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
const settingService = require("../../services/setting.service");
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const Transaction = require("../../models/transaction.model");
const partyService = require("../../services/party.service");
const billTypes = require("../../constants/billTypes");
const { moneyUtils } = require("../../utils");
const {
  ProformaInvoiceDuplicate,
  ProformaInvoiceNotFound,
} = require("../../errors/proformaInvoice.error");
const proformaInvoiceDto = require("../../dto/proformaInvoice.dto");
const {
  PurchaseOrderNotFound,
  PurchaseOrderDuplicate,
} = require("../../errors/purchaseOrder.error");
const {
  QuoteNotFound,
  QuotationDuplicate,
} = require("../../errors/quote.error");
const Quotes = require("../../models/quotes.model");
const { quoteDto } = require("../../dto/quotes.dto");
const { purchaseOrderDto } = require("../../dto/purchaseOrder.dto");

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
    NotFound: PurchaseOrderNotFound,
    dto: purchaseOrderDto,
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
};
const upsertBill = async (params) => {
  try {
    const modelProps = models[params.type];
    const { Bill, prefixType } = modelProps;
    let party;
    const makeRequestBody = async () => {
      logger.info("Bill details ", params);
      logger.info(`Executing ${params?.billId ? "Edit" : "Create"} flow`);

      party = await partyService.upsert({
        ...params,
        ...(params.partyDetails || {}),
      });
      params.partyId = party._id.toString();
      const setting = await settingService.getDetailedSettingForOrg(params.org);
      const displaySetting = await settingService.getDisplaySettingForOrg(params.org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const toSmallest = (val) => moneyUtils.toSmallestUnit(val, decimalDigits);
      const items = [];
      const ums = await getUmListForOrg(params.org);
      const taxes = await getTaxListForOrg(params.org);

      const sequence = await billService.getNextSequence({
        Bill,
        org: params.org,
      });

      params.items.forEach((item) => {
        let taxId = null;

        if (item.tax?.length) {
          let matchedTax = null;

          if (item.tax.length === 1) {
            const incomingTax = item.tax[0];
            matchedTax = taxes.find(
              (t) =>
                t.type === "single" &&
                t.category === incomingTax.type &&
                Number(t.percentage) === Number(incomingTax.percentage),
            );

            if (
              !matchedTax &&
              (incomingTax.type === "others" || incomingTax.type === "none")
            ) {
              matchedTax = taxes.find(
                (t) =>
                  t.type === "grouped" &&
                  Number(t.percentage) === Number(incomingTax.percentage),
              );
            }
          } else {
            const totalIncomingTax = item.tax.reduce(
              (sum, t) => sum + Number(t.percentage || 0),
              0,
            );
            matchedTax = taxes.find(
              (t) =>
                t.type === "grouped" &&
                Number(t.percentage) === totalIncomingTax,
            );
          }

          taxId = matchedTax?._id?.toString();
        }

        const storedUm = ums.find((um) => {
          const searchTerm = item?.um?.toLowerCase();
          if (!searchTerm) return false;
          return (
            um.name.toLowerCase().includes(searchTerm) ||
            um.unit.toLowerCase().includes(searchTerm)
          );
        });

        const um = storedUm
          ? storedUm._id.toString()
          : setting?.receiptDefaults?.um?._id?.toString();

        items.push({
          name: item.name,
          price: toSmallest(item.price),
          quantity: item?.quantity || 1,
          code: item?.code,
          um,
          tax: taxId || setting?.receiptDefaults?.tax?._id?.toString(),
          product: item.productId,
        });
      });
      const terms = (setting?.receiptDefaults?.terms||{})[prefixType]
      return {
        party: params.partyId,
        billingAddress: party.billingAddress,
        items,
        terms,
        date: params.date || new Date().toISOString().split("T")[0],
        prefix: (setting?.transactionPrefix||{})[prefixType] ||"",
        org: params.org,
        sequence,
        createdBy: params.createdBy,
        ...(params?.poNo && { poNo: params.poNo }),
        ...(params?.poDate && { poDate: params.poDate }),
        ...(params?.num && { num: params.num }),
        ...(params?.shippingCharges && {
          shippingCharges: toSmallest(params.shippingCharges),
        }),
      };
    };

   

    if (!Bill) throw new Error("Invalid bill type");

    const requestBody = await makeRequestBody();
    logger.info("Bill Body " + JSON.stringify(requestBody));

    if (params.dryRun) {
      const displaySetting = await settingService.getDisplaySettingForOrg(params.org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const fromSmallest = (val) => moneyUtils.fromSmallestUnit(val, decimalDigits);

      return {
        ...requestBody,
        partyDetails: party,
        items: requestBody.items.map(item => ({
          ...item,
          price: fromSmallest(item.price),
        })),
        shippingCharges: fromSmallest(requestBody.shippingCharges || 0),
        dryRun: true,
        message: "Data extracted successfully. You can now review and save the document.",
      };
    }

    const bill = await executeMongoDbTransaction(async (session) => {
      const billDoc = await billService.saveBill({
        ...modelProps,
        billId: params?.billId,
        requestBody,
        session,
      });

      await OrgModel.updateOne(
        { _id: params.org },
        { $inc: { [`relatedDocsCount.${modelProps.relatedDocType}`]: 1 } },
      ).session(session);

      logger.info(`${Bill.modelName} created ${billDoc.id}`);
      return billDoc;
    });

    logger.info("Bill created");
    return billService.getBillDetail({
      Bill,
      filter: { _id: bill._id, org: params.org },
      NotFound: modelProps.NotFound,
      minimal: true,
    });
  } catch (error) {
    throw error;
  }
};
const billHandler = {
  download_bill: async (params) => {
    try {
      const modelProps = models[params.type];
      const { Bill } = modelProps;
      if (!Bill) throw new Error("Invalid bill type");

      const filter = { org: params.org };
      if (params.billId) filter._id = params.billId;
      if (params.billNumber) filter.num = params.billNumber;

      const bill = await Bill.findOne(filter).lean();
      if (!bill) throw new modelProps.NotFound();

      const downloadUrl = `/api/v1/organizations/${params.org}/${params.type}/${bill._id}/download`;
      const docTypeLabel = params.type.slice(0, -1);
      return {
        message: `I've prepared the download for ${docTypeLabel} ${bill.num}.`,
        aiResponse: `I have found the ${docTypeLabel} ${bill.num} and generated a download link for it. Please do not include the download link in your text response, as I will provide a dedicated download button for it.`,
        downloads: [
          {
            name: `${docTypeLabel}_${bill.num}.pdf`,
            url: downloadUrl,
            type: "file",
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  },
  find_bills: async (params) => {
    try {
      const filter = { org: params.org };

      if (params.type) {
        filter.docModel = params.type;
      }

      if (params.partyName) {
        const parties = await partyService.getPartiesForAI(
          params.partyName,
          null,
          params.org,
        );
        if (parties.length > 0) {
          filter.party = parties[0]._id;
        }
      }

      const displaySetting = await settingService.getDisplaySettingForOrg(
        params.org,
      );
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const toSmallest = (val) =>
        moneyUtils.toSmallestUnit(val, decimalDigits);
      const fromSmallest = (val) =>
        moneyUtils.fromSmallestUnit(val, decimalDigits);

      if (params.minAmount != null || params.maxAmount != null) {
        filter.$expr = { $and: [] };
        const sumExpr = {
          $add: [
            { $ifNull: ["$total", 0] },
            { $ifNull: ["$totalTax", 0] },
            { $ifNull: ["$shippingCharges", 0] },
          ],
        };
        if (params.minAmount != null) {
          filter.$expr.$and.push({
            $gte: [sumExpr, toSmallest(params.minAmount)],
          });
        }
        if (params.maxAmount != null) {
          filter.$expr.$and.push({
            $lte: [sumExpr, toSmallest(params.maxAmount)],
          });
        }
      }

      if (params.date) {
        const start = new Date(params.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(params.date);
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      } else if (params.startDate || params.endDate) {
        filter.date = {};
        if (params.startDate) filter.date.$gte = new Date(params.startDate);
        if (params.endDate) filter.date.$lte = new Date(params.endDate);
      }

      const transactions = await Transaction.find(filter)
        .populate("party")
        .populate("doc")
        .sort({ date: -1 })
        .limit(20)
        .lean();

      return transactions.map((t) => ({
        _id: t.doc?._id || t._id,
        num: t.doc?.num || "N/A",
        type: t.docModel,
        date: t.date,
        party: t.party?.name || "N/A",
        grandTotal: fromSmallest(
          (t.total || 0) + (t.totalTax || 0) + (t.shippingCharges || 0),
        ),
        status: t.doc?.status || "N/A",
      }));
    } catch (error) {
      throw error;
    }
  },
  find_bill: async (params) => {
    const modelProps = models[params.type];
    const { Bill } = modelProps;
    if (!Bill) throw new Error("Invalid bill type");
    const filter = { org: params.org };
    if (params.billId) filter._id = params.billId;
    if (params.billNumber) filter.num = params.billNumber;
    return billService.getBillDetail({
      Bill,
      filter,
      NotFound: modelProps.NotFound,
      minimal: true,
    });
  },
  create_bill: upsertBill,
};

module.exports = billHandler;
