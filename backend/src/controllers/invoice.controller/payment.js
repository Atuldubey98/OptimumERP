const { isValidObjectId } = require("mongoose");
const { InvoiceNotFound } = require("../../errors/invoice.error");
const Joi = require("joi");
const Invoice = require("../../models/invoice.model");
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
  const userId = req.session.user._id;

  if (!isValidObjectId(id)) throw new InvoiceNotFound();
  const body = await paymentDto.validateAsync(req.body);

  await executeMongoDbTransaction(async (session) => {
    const invoice = await Invoice.findOne({ _id: id, org: orgId }).session(session);
    if (!invoice) throw new InvoiceNotFound();

    const voucher = await createPaymentVoucherForDoc({
      doc: invoice,
      docModel: "invoice",
      voucherType: "receipt",
      body,
      userId,
      session
    });

    if (!invoice.paymentVouchers) invoice.paymentVouchers = [];
    invoice.paymentVouchers.push(voucher._id);
    invoice.updatedBy = userId;
    invoice.status = "sent";
    await invoice.save({ session });
  });

  return res.status(201).json({ message: req.t('invoice:invoice:payment_added') });
};

module.exports = payment;
