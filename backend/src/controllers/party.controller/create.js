const { createPartyDto } = require("../../dto/party.dto");
const { OrgNotFound } = require("../../errors/org.error");
const partyService = require("../../services/party.service");
const create = async (req, res) => {
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const body = await createPartyDto.validateAsync({
        ...req.body,
        org: orgId,
    });
  const party = await partyService.create(body);
  return res.status(201).json({ data: party });
};

module.exports = create;
