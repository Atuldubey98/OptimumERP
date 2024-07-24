const { umDto } = require("../../dto/um.dto");
const OrgModel = require("../../models/org.model");
const Um = require("../../models/um.model");
const create = async (req, res) => {
  const body = await umDto.validateAsync(req.body);
  body.org = req.params.orgId;
  const um = new Um(body);
  await um.save();
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { "relatedDocsCount.ums": 1 } }
  );
  return res.status(201).json({ data: um, message: "Um created !" });
};

module.exports = create;
