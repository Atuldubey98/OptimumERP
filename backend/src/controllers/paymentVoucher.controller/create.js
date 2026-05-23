const { z } = require("zod");
const { createStandalonePaymentVoucher } = require("../../services/paymentVoucher.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");

const createDto = z.object({
  party: z.string().nullable().optional(),
  amount: z.number().int(),
  paymentMode: z.string().optional(),
  date: z.string(),
  voucherType: z.enum(["receipt", "payment"]),
  description: z.string().optional(),
  refDoc: z.string().nullable().optional(),
  refDocModel: z.enum(["invoice", "purchase"]).nullable().optional(),
});

const create = async (req, res) => {
  const orgId = req.params.orgId;
  const userId = req.session.user._id;

  const body = await createDto.parseAsync(req.body);

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
