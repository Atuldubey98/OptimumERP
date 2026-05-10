const { createStandalonePaymentVoucher, createPaymentVoucherForDoc, addPaymentToDoc } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const partyService = require("../../services/party.service");
const PaymentVoucher = require("../../models/paymentVoucher.model");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const { moneyUtils } = require("../../utils");
const settingService = require("../../services/setting.service");

const createPaymentVoucher = async (params) => {
  const { org, createdBy, user, ...body } = params;

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
      return await addPaymentToDoc({
        id: body.refDocId,
        orgId: org,
        userId: createdBy,
        body: voucherData,
        docModel: body.refDocModel,
        voucherType: body.voucherType,
        session,
      });
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

const listDocumentVouchers = async (params) => {
  const { org, docNumber, docModel } = params;

  const Model = docModel === "invoice" ? Invoice : Purchase;
  const doc = await Model.findOne({ num: docNumber, org }).lean();

  if (!doc) {
    throw new Error(`${docModel} not found`);
  }

  const vouchers = await PaymentVoucher.find({
    org,
    refDoc: doc._id,
    refDocModel: docModel
  }).populate("party", "name").lean();

  const displaySetting = await settingService.getDisplaySettingForOrg(org);
  const currencyConfig = await moneyUtils.getCurrencyConfigByCode(displaySetting?.currency || "INR");

  const decimalDigits = currencyConfig?.decimal_digits ?? 2;

  return vouchers.map(v => ({
    ...v,
    amount: moneyUtils.fromSmallestUnit(v.amount, decimalDigits)
  }));
};

const paymentVoucherHandler = {
  create_payment_voucher: createPaymentVoucher,
  find_payment_voucher: findPaymentVoucher,
  list_document_vouchers: listDocumentVouchers,
};

module.exports = paymentVoucherHandler;
