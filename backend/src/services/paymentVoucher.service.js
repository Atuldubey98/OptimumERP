const PaymentVoucher = require("../models/paymentVoucher.model");
const Transaction = require("../models/transaction.model");
const Setting = require("../models/settings.model");
const OrgModel = require("../models/org.model");

const getNextSequence = async (orgId, session) => {
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
  return { sequence, prefix, num, financialYear: setting.financialYear };
};

const updateDocPaymentStatus = async ({ doc, docModel }) => {
  const grandTotal = (doc.total || 0) + (doc.totalTax || 0) + (doc.shippingCharges || 0);
  const totalPaid = doc.paymentVoucherBalance || 0;

  if (docModel === "purchase") {
    doc.status = totalPaid >= grandTotal ? "paid" : "unpaid";
  } else if (docModel === "invoice") {
    doc.status = "sent";
  }
};

exports.createPaymentVoucher = async ({ orgId, userId, body, doc, docModel, voucherType, session }) => {
  const { sequence, prefix, num, financialYear: settingFY } = await getNextSequence(orgId, session);

  const fy = (doc && doc.financialYear) ? doc.financialYear : settingFY;
  if (!fy || !fy.start || !fy.end) {
    throw new Error("Financial year configuration is missing or invalid");
  }

  const voucherData = {
    org: orgId,
    party: doc ? doc.party : body.party,
    createdBy: userId,
    updatedBy: userId,
    voucherType: voucherType || body.voucherType,
    amount: body.amount,
    paymentMode: body.paymentMode,
    description: body.description || (doc ? `Payment for ${doc.num}` : `${(voucherType || body.voucherType) === "receipt" ? "Receipt" : "Payment"} voucher`),
    date: body.date,
    financialYear: {
      start: fy.start,
      end: fy.end
    },
    sequence,
    prefix,
    num,
  };

  if (doc) {
    voucherData.refDoc = doc._id;
    voucherData.refDocModel = docModel;
  }

  const voucher = new PaymentVoucher(voucherData);
  await voucher.save({ session });

  const transaction = new Transaction({
    org: orgId,
    createdBy: userId,
    docModel: "payment_voucher",
    financialYear: {
      start: voucher.financialYear.start,
      end: voucher.financialYear.end
    },
    date: voucher.date,
    total: voucher.amount,
    totalTax: 0,
    shippingCharges: 0,
    party: voucher.party,
    doc: voucher._id,
    voucherType: voucher.voucherType,
  });
  await transaction.save({ session });
  await OrgModel.updateOne(
    { _id: orgId },
    { $inc: { "relatedDocsCount.paymentVouchers": 1 } },
    { session }
  );

  return voucher;
};

exports.addPaymentToDoc = async ({ id, orgId, userId, body, docModel, voucherType, session }) => {
  const Model = require(`../models/${docModel}.model`);
  const doc = await Model.findOne({ _id: id, org: orgId }).session(session);
  if (!doc) throw new Error(`${docModel} not found`);

  const voucher = await exports.createPaymentVoucher({
    orgId,
    userId,
    body,
    doc,
    docModel,
    voucherType,
    session
  });

  if (!doc.paymentVouchers) doc.paymentVouchers = [];
  doc.paymentVouchers.push(voucher._id);
  doc.paymentVoucherBalance = (doc.paymentVoucherBalance || 0) + voucher.amount;
  doc.updatedBy = userId;

  await updateDocPaymentStatus({ doc, docModel });
  await doc.save({ session });
  
  return voucher;
};


exports.createPaymentVoucherForDoc = async ({ doc, docModel, voucherType, body, userId, session }) => {
  return exports.createPaymentVoucher({
    orgId: doc.org,
    userId,
    body,
    doc,
    docModel,
    voucherType,
    session
  });
};

exports.createStandalonePaymentVoucher = async ({ orgId, userId, body, session }) => {
  if (body.refDoc && body.refDocModel) {
    return await exports.addPaymentToDoc({
      id: body.refDoc,
      orgId,
      userId,
      body,
      docModel: body.refDocModel,
      voucherType: body.voucherType,
      session
    });
  }
  return exports.createPaymentVoucher({
    orgId,
    userId,
    body,
    session
  });
};

exports.updatePaymentVoucher = async ({ id, orgId, userId, body, session }) => {
  const voucher = await PaymentVoucher.findOne({ _id: id, org: orgId }).session(session);
  if (!voucher) throw new Error("Payment voucher not found");

  const oldAmount = voucher.amount;
  const fields = ["amount", "paymentMode", "description", "date", "party"];
  fields.forEach(field => {
    if (body[field] !== undefined) voucher[field] = body[field];
  });
  voucher.updatedBy = userId;

  await voucher.save({ session });

  await Transaction.updateOne(
    { docModel: "payment_voucher", doc: voucher._id, org: orgId },
    {
      $set: {
        total: voucher.amount,
        date: voucher.date,
        party: voucher.party,
        voucherType: voucher.voucherType,
      }
    },
    { session }
  );

  if (voucher.refDoc && voucher.refDocModel && oldAmount !== voucher.amount) {
    const Model = require(`../models/${voucher.refDocModel}.model`);
    const doc = await Model.findOne({ _id: voucher.refDoc, org: orgId }).session(session);
    if (doc) {
      doc.paymentVoucherBalance = (doc.paymentVoucherBalance || 0) - oldAmount + voucher.amount;
      doc.updatedBy = userId;
      await updateDocPaymentStatus({ doc, docModel: voucher.refDocModel });
      await doc.save({ session });
    }
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
      doc.paymentVoucherBalance = (doc.paymentVoucherBalance || 0) - voucher.amount;
      await updateDocPaymentStatus({ doc, docModel: voucher.refDocModel });
      await doc.save({ session });
    }
  }

  await Transaction.softDelete({ docModel: "payment_voucher", doc: voucher._id }).session(session);
  await PaymentVoucher.softDelete({ _id: voucher._id }).session(session);
  await OrgModel.updateOne(
    { _id: orgId },
    { $inc: { "relatedDocsCount.paymentVouchers": -1 } },
    { session }
  );
};
