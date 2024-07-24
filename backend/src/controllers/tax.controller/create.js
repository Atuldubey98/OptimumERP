const { Types } = require("mongoose");
const { taxDto } = require("../../dto/tax.dto");
const Tax = require("../../models/tax.model");
const OrgModel = require("../../models/org.model");

const calculateTotalPercentageForSingleTaxes = async (taxIds = [], orgId) => {
  const childTaxes = await Tax.aggregate([
    {
      $match: {
        org: new Types.ObjectId(orgId),
        type: "single",
        _id: { $in: taxIds },
      },
    },
    {
      $group: {
        _id: null,
        totalPercentage: { $sum: "$percentage" },
      },
    },
  ]);
  return childTaxes.length ? childTaxes[0].totalPercentage : 0;
};

const create = async (req, res) => {
  const body = await taxDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const tax = new Tax(body);
  if (tax.category === "none") {
    tax.percentage = 0;
    tax.type = "single";
    tax.children = [];
  }
  if (tax.type === "grouped")
    tax.percentage = await calculateTotalPercentageForSingleTaxes(
      tax.children,
      req.params.orgId
    );
  await (await tax.save()).populate("children");
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.taxes": 1 } }
  );
  return res.status(200).json({ data: tax, message: "Tax created" });
};

module.exports = create;
