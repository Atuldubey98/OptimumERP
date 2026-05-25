const Joi = require("joi");
const { isValidObjectId } = require("mongoose");
const { updatePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const updateDto = Joi.object({
  description: Joi.string().allow("").label("Description"),
  amount: Joi.number().integer().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().label("Date"),
  party: Joi.string().label("Party"),
  voucherType: Joi.string().valid("receipt", "payment").label("Voucher Type"),
  refDoc: Joi.string().allow(null).label("Reference Document"),
  refDocModel: Joi.string().valid("invoice", "purchase").allow(null).label("Reference Document Model"),
}).min(1);

const update = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid voucher ID" });
  }

  const body = await updateDto.validateAsync(req.body);

  await executeMongoDbTransaction(async (session) => {
    await updatePaymentVoucher({
      id,
      orgId,
      userId,
      body,
      session
    });
  });

  return res.status(200).json({ message: "Payment voucher updated successfully" });
};

module.exports = update;
