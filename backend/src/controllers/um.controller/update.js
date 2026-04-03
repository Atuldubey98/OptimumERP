const { umDto } = require("../../dto/um.dto");
const Um = require("../../models/um.model");
const { invalidateUmCache } = require("../../services/um.service");
const update = async (req, res) => {
  const body = await umDto.validateAsync(req.body);
  const um = await Um.findOneAndUpdate(
    {
      org: req.params.orgId,
      _id: req.params.id,
    },
    body
  );
  if (!um) throw new Error(req.t("common:api.um_not_found"));
  invalidateUmCache(req.params.orgId);
  return res.status(200).json({ message: req.t("common:api.um_updated") });
};

module.exports = update;