const { isValidObjectId } = require("mongoose");
const { InvoiceNotFound } = require("../../errors/invoice.error");
const Joi = require("joi");
const Invoice = require("../../models/invoice.model");
const paymentDto = Joi.object({
  description: Joi.string().allow("").required().label("Description"),
  amount: Joi.number().required().label("Amount"),
  paymentMode: Joi.string().allow("").label("Payment Mode"),
  date: Joi.string().required().label("Date"),
});
const payment = async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new InvoiceNotFound();
  const body = await paymentDto.validateAsync(req.body);
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, org: req.params.orgId },
    { payment: body, updatedBy: req.session.user._id }
  );
  if (!invoice) throw new InvoiceNotFound();
  return res.status(201).json({ message: "Payment added" });
};
module.exports = payment;
