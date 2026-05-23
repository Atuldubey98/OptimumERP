const { isValidObjectId } = require("mongoose");
const { PurchaseNotFound } = require("../../errors/purchase.error");
const Joi = require("joi");
const { addPaymentToDoc } = require("../../services/paymentVoucher.service");
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

  await executeMongoDbTransaction(async (session) => {
    await addPaymentToDoc({
      id,
      orgId,
      userId,
      body,
      docModel: "purchase",
      voucherType: "payment",
      session
    });
  });

  return res.status(201).json({ message: req.t("common:api.payment_added") });
};

module.exports = payment;
