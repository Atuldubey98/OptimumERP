const { createPaymentVoucherDto } = require("../../dto/paymentVoucher.dto");
const { createStandalonePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const create = async (req, res) => {
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  const body = await createPaymentVoucherDto.validateAsync(req.body);

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
