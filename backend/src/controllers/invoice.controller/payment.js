const { isValidObjectId } = require("mongoose");
const { InvoiceNotFound } = require("../../errors/invoice.error");
const { z } = require("zod");
const { addPaymentToDoc } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const paymentDto = z.object({
  description: z.string(),
  amount: z.number().int(),
  paymentMode: z.string().optional(),
  date: z.string(),
});

const payment = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;
  const userId = req.session.user._id;
  
  if (!isValidObjectId(id)) throw new InvoiceNotFound();
  const body = await paymentDto.parseAsync(req.body);

  await executeMongoDbTransaction(async (session) => {
    await addPaymentToDoc({
      id,
      orgId,
      userId,
      body,
      docModel: "invoice",
      voucherType: "receipt",
      session
    });
  });

  return res.status(201).json({ message: req.t('invoice:invoice:payment_added') });
};

module.exports = payment;
