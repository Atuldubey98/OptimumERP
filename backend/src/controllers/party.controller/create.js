const { createPartyDto } = require("../../dto/party.dto");
const { OrgNotFound } = require("../../errors/org.error");
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const Party = require("../../models/party.model");

const create = async (req, res) => {
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const body = await createPartyDto.validateAsync({
    ...req.body,
    org: orgId,
  });
  const party = new Party(body);
  await party.save();
  await OrgModel.updateOne(
    { _id: orgId },
    { $inc: { "relatedDocsCount.parties": 1 } }
  );
  logger.info(`created party ${party.id}`);
  return res.status(201).json({ message: "Party created !", data: party });
};

module.exports = create;
