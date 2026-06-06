const Joi = require("joi");
const mongoose = require("mongoose");
const Setting = require("../../models/settings.model");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const Expense = require("../../models/expense.model");
const PaymentVoucher = require("../../models/paymentVoucher.model");
const logService = require("../../services/log.service");
const { invalidateSettingCache } = require("../../services/setting.service");
const { InvalidFinancialYearStart, InvalidFinancialYearEnd } = require("../../errors/org.error");
const { SettingNotFound } = require("../../errors/setting.error");

const closeFinancialYear = async (req, res) => {
  const orgId = req.params.orgId;
  const body = await Joi.object({
    financialYear: {
      start: Joi.string().required(),
      end: Joi.string().required(),
    },
    transactionPrefix: {
      invoice: Joi.string().allow(""),
      quotation: Joi.string().allow(""),
      purchaseOrder: Joi.string().allow(""),
      proformaInvoice: Joi.string().allow(""),
      paymentVoucher: Joi.string().allow(""),
    },
  }).validateAsync(req.body);

  const currentSetting = await Setting.findOne({ org: orgId });
  if (!currentSetting) {
    throw new SettingNotFound();
  }

  const newStart = new Date(body.financialYear.start);
  const newEnd = new Date(body.financialYear.end);
  const oldStart = new Date(currentSetting.financialYear.start);
  const oldEnd = new Date(currentSetting.financialYear.end);

  if (newStart <= oldStart) {
    throw new InvalidFinancialYearStart();
  }
  if (newEnd <= newStart) {
    throw new InvalidFinancialYearEnd();
  }

  const orgObjectId = new mongoose.Types.ObjectId(orgId);

  const invoiceSummary = await Invoice.aggregate([
    {
      $match: {
        org: orgObjectId,
        "financialYear.start": oldStart,
        "financialYear.end": oldEnd,
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: { $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }] } }
      }
    }
  ]);

  const purchaseSummary = await Purchase.aggregate([
    {
      $match: {
        org: orgObjectId,
        "financialYear.start": oldStart,
        "financialYear.end": oldEnd,
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: { $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }] } }
      }
    }
  ]);

  const expenseSummary = await Expense.aggregate([
    {
      $match: {
        org: orgObjectId,
        date: { $gte: oldStart, $lte: oldEnd },
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const voucherSummary = await PaymentVoucher.aggregate([
    {
      $match: {
        org: orgObjectId,
        "financialYear.start": oldStart,
        "financialYear.end": oldEnd,
      }
    },
    {
      $group: {
        _id: "$voucherType",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const getSummary = (aggResult) => aggResult[0] || { count: 0, totalAmount: 0 };
  const receipts = voucherSummary.find(v => v._id === "receipt") || { count: 0, totalAmount: 0 };
  const payments = voucherSummary.find(v => v._id === "payment") || { count: 0, totalAmount: 0 };

  const summary = {
    invoices: getSummary(invoiceSummary),
    purchases: getSummary(purchaseSummary),
    expenses: getSummary(expenseSummary),
    receipts: { count: receipts.count, totalAmount: receipts.totalAmount },
    payments: { count: payments.count, totalAmount: payments.totalAmount },
  };

  const updatedSetting = await Setting.findOneAndUpdate(
    { org: orgId },
    {
      $set: {
        financialYear: body.financialYear,
        transactionPrefix: body.transactionPrefix,
        sequenceCounters: {
          invoice: 0,
          quotation: 0,
          purchaseOrder: 0,
          proformaInvoice: 0,
          paymentVoucher: 0,
        },
      },
      $addToSet: {
        "prefixes.invoice": body.transactionPrefix.invoice,
        "prefixes.quotation": body.transactionPrefix.quotation,
        "prefixes.purchaseOrder": body.transactionPrefix.purchaseOrder,
        "prefixes.proformaInvoice": body.transactionPrefix.proformaInvoice,
        "prefixes.paymentVoucher": body.transactionPrefix.paymentVoucher,
      },
    },
    {
      new: true,
    }
  );

  invalidateSettingCache(orgId);

  await logService.recordAudit({
    org: orgId,
    user: req.session?.user?._id,
    docModel: "setting",
    doc: currentSetting._id,
    action: "updated",
    changes: {
      oldFinancialYear: {
        start: oldStart,
        end: oldEnd
      },
      newFinancialYear: body.financialYear,
      summary
    }
  });

  return res
    .status(200)
    .json({
      message: req.t("common:api.financial_year_updated"),
      data: updatedSetting,
      summary
    });
};

module.exports = closeFinancialYear;
