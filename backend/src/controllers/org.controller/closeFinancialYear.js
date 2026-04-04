const Joi = require("joi");
const Setting = require("../../models/settings.model");
const { invalidateSettingCache } = require("../../services/setting.service");

const closeFinancialYear = async (req, res) => {
  const orgId = req.params.orgId;
  const body = await Joi.object({
    financialYear: {
      start: Joi.string().required(),
      end: Joi.string().required(),
    },
    transactionPrefix: {
      invoice: Joi.string().allow(""),
      quotation: Joi.string().allow(""),
      purchaseOrder: Joi.string().allow(""),
      proformaInvoice: Joi.string().allow(""),
      saleOrder: Joi.string().allow(""),
    },
  }).validateAsync(req.body);
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
        },
      },
      $addToSet: {
        "prefixes.invoice": body.transactionPrefix.invoice,
        "prefixes.quotation": body.transactionPrefix.quotation,
        "prefixes.purchaseOrder": body.transactionPrefix.purchaseOrder,
        "prefixes.proformaInvoice": body.transactionPrefix.proformaInvoice,
        "prefixes.saleOrder": body.transactionPrefix.saleOrder,
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
