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
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const purchase = await payoutPurchaseInvoice({
    filter,
    body,
    userId: req.session?.user?._id,
  });
  if (!purchase) throw new PurchaseNotFound();
  return res.status(201).json({ message: "Payment added" });
};

module.exports = payment;
async function payoutPurchaseInvoice({ filter, userId, body }) {
  const purchase = await Purchase.findOne(filter);
  const grandTotal = purchase.total + purchase.totalTax;
  const isPurchaseFullyPaid = grandTotal > body.amount;
  purchase.status = isPurchaseFullyPaid ? "unpaid" : "paid";
  purchase.updatedBy = userId;
  purchase.payment = body;
  await purchase.save();
  return purchase;
}
