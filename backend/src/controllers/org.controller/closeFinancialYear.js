const Joi = require("joi");
const Setting = require("../../models/settings.model");

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
      ...body,
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
  return res
    .status(200)
    .json({ message: "Financial year updated", data: setting });
};

module.exports = closeFinancialYear;
