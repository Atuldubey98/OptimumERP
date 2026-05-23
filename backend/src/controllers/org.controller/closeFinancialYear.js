const { z } = require("zod");
const Setting = require("../../models/settings.model");
const { invalidateSettingCache } = require("../../services/setting.service");

const closeFinancialYear = async (req, res) => {
  const orgId = req.params.orgId;
  const body = await z.object({
    financialYear: z.object({
      start: z.string(),
      end: z.string(),
    }),
    transactionPrefix: z.object({
      invoice: z.string().optional(),
      quotation: z.string().optional(),
      purchaseOrder: z.string().optional(),
      proformaInvoice: z.string().optional(),
      saleOrder: z.string().optional(),
      paymentVoucher: z.string().optional(),
    }),
  }).parseAsync(req.body);
  const setting = await Setting.findOneAndUpdate(
    { org: orgId },
    {
      $set: {
        financialYear: body.financialYear,
        transactionPrefix: body.transactionPrefix,
        sequenceCounters: {
          invoice: 0,
          quotation: 0,
          purchaseOrder: 0,
          proformaInvoice: 0,
          saleOrder: 0,
          paymentVoucher: 0,
        },
      },
      $addToSet: {
        "prefixes.invoice": body.transactionPrefix.invoice,
        "prefixes.quotation": body.transactionPrefix.quotation,
        "prefixes.purchaseOrder": body.transactionPrefix.purchaseOrder,
        "prefixes.proformaInvoice": body.transactionPrefix.proformaInvoice,
        "prefixes.saleOrder": body.transactionPrefix.saleOrder,
        "prefixes.paymentVoucher": body.transactionPrefix.paymentVoucher,
      },
    },
    {
      new: true,
    }
  );
  invalidateSettingCache(orgId);

  return res
    .status(200)
    .json({ message: req.t("common:api.financial_year_updated"), data: setting });
};

module.exports = closeFinancialYear;
