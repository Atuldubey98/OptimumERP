const { createPartyDto } = require("../../dto/party.dto");
const logger = require("../../logger");
const partyService = require("../../services/party.service");
const migrate = async (req, res) => {
  const platform = req.params.platform;
  const platforms = ["vyapar"];
  if (!platforms.includes(platform)) {
    return res.status(400).json({ message: "Unsupported platform" });
  }
  const parties = Array.isArray(req.body?.parties) ? req.body?.parties : [];
  let failed = 0, succeeded = 0;
  for (const partyBody of parties) {
    try {
      const body = await createPartyDto.validateAsync({
        ...partyBody,
        org: req.params.orgId,
        createdBy: req.session.user._id,
      });
      await partyService.create(body);
      succeeded++;
    } catch (error) {
      logger.error(`Failed to migrate party: ${error.message}`);
      failed++;
    }
  }
  return res.status(200).json({ message: `Successfully migrated ${succeeded} parties, failed to migrate ${failed} parties` });
}

module.exports = migrate;