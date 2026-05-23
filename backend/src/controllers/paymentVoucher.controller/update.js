const { z } = require("zod");
const { isValidObjectId } = require("mongoose");
const { updatePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const updateDto = z.object({
  description: z.string().optional(),
  amount: z.number().int().optional(),
  paymentMode: z.string().optional(),
  date: z.string().optional(),
  party: z.string().optional(),
  voucherType: z.enum(["receipt", "payment"]).optional(),
}).refine(data => Object.keys(data).length >= 1, { message: "At least one field must be provided" });

const update = async (req, res) => {
  const id = req.params.id;
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid voucher ID" });
  }

  const body = await updateDto.parseAsync(req.body);

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
