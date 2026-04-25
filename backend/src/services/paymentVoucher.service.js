const PaymentVoucher = require("../models/paymentVoucher.model");
const Transaction = require("../models/transaction.model");
const Setting = require("../models/settings.model");

exports.createPaymentVoucherForDoc = async ({ doc, docModel, voucherType, body, userId, session }) => {
  const orgId = doc.org;
  
  const setting = await Setting.findOne({ org: orgId }).session(session);
  if (!setting) {
    throw new Error("Organization settings not found");
  }

  const counterKey = "paymentVoucher";
  let sequence = setting.sequenceCounters?.[counterKey] || 0;
  sequence += 1;

  await Setting.updateOne(
    { org: orgId },
    { $max: { [`sequenceCounters.${counterKey}`]: sequence } },
    { session }
  );

  const prefix = setting.transactionPrefix?.[counterKey] || "";
  const num = prefix + sequence;

  const voucher = new PaymentVoucher({
    org: orgId,
    party: doc.party,
    createdBy: userId,
    updatedBy: userId,
    voucherType,
    amount: body.amount,
    paymentMode: body.paymentMode,
    description: body.description || `Payment for ${doc.num}`,
    date: body.date,
    financialYear: doc.financialYear,
    sequence,
    prefix,
    num,
    refDoc: doc._id,
    refDocModel: docModel
  });
  
  await voucher.save({ session });

  const transaction = new Transaction({
    org: orgId,
    createdBy: userId,
    docModel: "payment_voucher",
    financialYear: doc.financialYear,
    date: voucher.date,
    total: voucher.amount,
    totalTax: 0,
    shippingCharges: 0,
    party: doc.party,
    doc: voucher._id,
    voucherType: voucher.voucherType,
  });
  await transaction.save({ session });

  return voucher;
};

exports.createStandalonePaymentVoucher = async ({ orgId, userId, body, session }) => {
  const setting = await Setting.findOne({ org: orgId }).session(session);
  if (!setting) {
    throw new Error("Organization settings not found");
  }

  const counterKey = "paymentVoucher";
  let sequence = setting.sequenceCounters?.[counterKey] || 0;
  sequence += 1;

  await Setting.updateOne(
    { org: orgId },
    { $max: { [`sequenceCounters.${counterKey}`]: sequence } },
    { session }
  );

  const prefix = setting.transactionPrefix?.[counterKey] || "";
  const num = prefix + sequence;

  const voucher = new PaymentVoucher({
    org: orgId,
    party: body.party,
    createdBy: userId,
    updatedBy: userId,
    voucherType: body.voucherType,
    amount: body.amount,
    paymentMode: body.paymentMode,
    description: body.description || `${body.voucherType === "receipt" ? "Receipt" : "Payment"} voucher`,
    date: body.date,
    financialYear: setting.financialYear,
    sequence,
    prefix,
    num
  });
  await voucher.save({ session });

  const transaction = new Transaction({
    org: orgId,
    createdBy: userId,
    docModel: "payment_voucher",
    financialYear: setting.financialYear,
    date: voucher.date,
    total: voucher.amount,
    totalTax: 0,
    shippingCharges: 0,
    party: body.party,
    doc: voucher._id,
    voucherType: voucher.voucherType,
  });
  await transaction.save({ session });

  return voucher;
};

exports.updatePaymentVoucher = async ({ id, orgId, userId, body, session }) => {
  const voucher = await PaymentVoucher.findOne({ _id: id, org: orgId }).session(session);
  if (!voucher) {
    throw new Error("Payment voucher not found");
  }

  voucher.amount = body.amount ?? voucher.amount;
  voucher.paymentMode = body.paymentMode ?? voucher.paymentMode;
  voucher.description = body.description ?? voucher.description;
  voucher.date = body.date ?? voucher.date;
  voucher.party = body.party ?? voucher.party;
  voucher.updatedBy = userId;

  await voucher.save({ session });

  const transaction = await Transaction.findOne({ docModel: "payment_voucher", doc: voucher._id }).session(session);
  if (transaction) {
    transaction.total = voucher.amount;
    transaction.date = voucher.date;
    transaction.party = voucher.party;
    transaction.voucherType = voucher.voucherType;
    await transaction.save({ session });
  }

  return voucher;
};

exports.deletePaymentVoucher = async ({ id, orgId, session }) => {
  const voucher = await PaymentVoucher.findOne({ _id: id, org: orgId }).session(session);
  if (!voucher) {
    throw new Error("Payment voucher not found");
  }

  if (voucher.refDoc && voucher.refDocModel) {
    const Model = require(`../models/${voucher.refDocModel}.model`);
    const doc = await Model.findOne({ _id: voucher.refDoc }).session(session);
    if (doc && doc.paymentVouchers) {
      doc.paymentVouchers.pull(voucher._id);
      
      if (voucher.refDocModel === "purchase") {
        const grandTotal = doc.total + doc.totalTax + (doc.shippingCharges || 0);
        const otherVouchers = await PaymentVoucher.find({ 
          _id: { $in: doc.paymentVouchers },
          org: orgId 
        }).session(session);
        
        const totalPaid = otherVouchers.reduce((acc, v) => acc + v.amount, 0);
        doc.status = grandTotal <= totalPaid ? "paid" : "unpaid";
      }
      
      await doc.save({ session });
    }
  }

  await Transaction.deleteOne({ docModel: "payment_voucher", doc: voucher._id }).session(session);
  await PaymentVoucher.deleteOne({ _id: voucher._id }).session(session);
};
