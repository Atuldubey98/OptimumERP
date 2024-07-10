const { isValidObjectId } = require("mongoose");
const { PurchaseNotFound } = require("../../errors/purchase.error");
const Purchase = require("../../models/purchase.model");
const Joi = require("joi");

const paymentDto = Joi.object({
  description: Joi.string().allow("").required().label("Description"),
  amount: Joi.number().required().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().required().label("Date"),
});
const payment = async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new PurchaseNotFound();
  const body = await paymentDto.validateAsync(req.body);
  const purchase = await Purchase.findOne({
    _id: id,
    org: req.params.orgId,
  });
  const grandTotal = purchase.total + purchase.totalTax;
  purchase.status = grandTotal > body.amount ? "unpaid" : "paid";
  purchase.updatedBy = req.session.user._id;
  purchase.payment = body;
  await purchase.save();
  if (!purchase) throw new PurchaseNotFound();
  return res.status(201).json({ message: "Payment added" });
};

module.exports = payment;
