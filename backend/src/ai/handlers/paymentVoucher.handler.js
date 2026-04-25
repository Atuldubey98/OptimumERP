const { createStandalonePaymentVoucher, createPaymentVoucherForDoc } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const partyService = require("../../services/party.service");
const PaymentVoucher = require("../../models/paymentVoucher.model");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const logger = require("../../logger");
const { moneyUtils } = require("../../utils");
const settingService = require("../../services/setting.service");

const createPaymentVoucher = async (params) => {
  const { org, createdBy, ...body } = params;
  
  const party = await partyService.upsert({
    org,
    partyId: body.partyId,
    name: body.partyName,
  });

  const displaySetting = await settingService.getDisplaySettingForOrg(org);
  const currencyConfig = await moneyUtils.getCurrencyConfigByCode(displaySetting?.currency || "INR");
  const decimalDigits = currencyConfig?.decimal_digits ?? 2;

  const voucherData = {
    party: party._id,
    amount: moneyUtils.toSmallestUnit(body.amount, decimalDigits),
    paymentMode: body.paymentMode,
    date: body.date || new Date().toISOString().split("T")[0],
    voucherType: body.voucherType,
    description: body.description,
  };

  const voucher = await executeMongoDbTransaction(async (session) => {
    if (body.refDocId && body.refDocModel) {
      const Model = body.refDocModel === "invoice" ? Invoice : Purchase;
      const doc = await Model.findOne({ _id: body.refDocId, org }).session(session);
      if (!doc) throw new Error(`${body.refDocModel} not found`);

      const v = await createPaymentVoucherForDoc({
        doc,
        docModel: body.refDocModel,
        voucherType: body.voucherType,
        body: voucherData,
        userId: createdBy,
        session,
      });

      if (!doc.paymentVouchers) doc.paymentVouchers = [];
      doc.paymentVouchers.push(v._id);
      if (body.refDocModel === "purchase") {
        const grandTotal = doc.total + doc.totalTax + (doc.shippingCharges || 0);
        const allVouchers = await PaymentVoucher.find({ _id: { $in: doc.paymentVouchers }, org }).session(session);
        const totalPaid = allVouchers.reduce((acc, curr) => acc + curr.amount, 0);
        doc.status = grandTotal <= totalPaid ? "paid" : "unpaid";
      }
      await doc.save({ session });
      return v;
    }

    return await createStandalonePaymentVoucher({
      orgId: org,
      userId: createdBy,
      body: voucherData,
      session
    });
  });

  return voucher;
};

const findPaymentVoucher = async (params) => {
  const filter = { org: params.org };
  if (params.voucherId) filter._id = params.voucherId;
  if (params.voucherNumber) filter.num = params.voucherNumber;

  const voucher = await PaymentVoucher.findOne(filter).populate("party", "name").lean();
  if (!voucher) {
    throw new Error("Payment voucher not found");
  }
  return voucher;
};

const paymentVoucherHandler = {
  create_payment_voucher: createPaymentVoucher,
  find_payment_voucher: findPaymentVoucher,
};

module.exports = paymentVoucherHandler;
