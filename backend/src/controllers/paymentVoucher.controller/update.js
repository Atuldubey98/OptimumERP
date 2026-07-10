const { updatePaymentVoucherDto } = require("../../dto/paymentVoucher.dto");
const { isValidObjectId } = require("mongoose");
const { updatePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const update = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid voucher ID" });
  }

  const body = await updatePaymentVoucherDto.validateAsync(req.body);

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
