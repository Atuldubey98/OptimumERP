const { isValidObjectId } = require("mongoose");
const { deletePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const remove = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid voucher ID" });
  }

  await executeMongoDbTransaction(async (session) => {
    await deletePaymentVoucher({
      id,
      orgId,
      session
    });
  });

  return res.status(200).json({ message: "Payment voucher deleted successfully" });
};

module.exports = remove;
