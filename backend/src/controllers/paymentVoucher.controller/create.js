const Joi = require("joi");
const { createStandalonePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const createDto = Joi.object({
  party: Joi.string().required().label("Party"),
  amount: Joi.number().integer().required().label("Amount"),
  paymentMode: Joi.string().required().label("Payment Mode"),
  date: Joi.string().required().label("Date"),
  voucherType: Joi.string().valid("receipt", "payment").required().label("Voucher Type"),
  description: Joi.string().allow("").label("Description"),
});

const create = async (req, res) => {
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  const body = await createDto.validateAsync(req.body);

  const voucher = await executeMongoDbTransaction(async (session) => {
    return await createStandalonePaymentVoucher({
      orgId,
      userId,
      body,
      session
    });
  });

  return res.status(201).json({ 
    message: "Payment voucher created successfully",
    data: voucher 
  });
};

module.exports = create;
