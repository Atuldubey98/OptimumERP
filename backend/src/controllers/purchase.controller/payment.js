const { isValidObjectId } = require("mongoose");
const { PurchaseNotFound } = require("../../errors/purchase.error");
const Purchase = require("../../models/purchase.model");
const Joi = require("joi");
const { createPaymentVoucherForDoc } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const paymentDto = Joi.object({
  description: Joi.string().allow("").required().label("Description"),
  amount: Joi.number().integer().required().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().required().label("Date"),
});

const payment = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;
  const userId = req.session?.user?._id;

  if (!isValidObjectId(id)) throw new PurchaseNotFound();
  const body = await paymentDto.validateAsync(req.body);

  const filter = {
    _id: id,
    org: orgId,
  };

  await executeMongoDbTransaction(async (session) => {
    const purchase = await Purchase.findOne(filter).session(session);
    if (!purchase) throw new PurchaseNotFound();

    const voucher = await createPaymentVoucherForDoc({
      doc: purchase,
      docModel: "purchase",
      voucherType: "payment",
      body,
      userId,
      session
    });

    const grandTotal = purchase.total + purchase.totalTax + (purchase.shippingCharges || 0);
    const isPurchaseFullyPaid = grandTotal <= body.amount;
    
    purchase.status = isPurchaseFullyPaid ? "paid" : "unpaid";
    purchase.updatedBy = userId;
    if (!purchase.paymentVouchers) purchase.paymentVouchers = [];
    purchase.paymentVouchers.push(voucher._id);
    await purchase.save({ session });
  });

  return res.status(201).json({ message: req.t("common:api.payment_added") });
};

module.exports = payment;
