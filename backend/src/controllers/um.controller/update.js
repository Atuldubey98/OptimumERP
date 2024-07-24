const { umDto } = require("../../dto/um.dto");
const Um = require("../../models/um.model");
const update = async (req, res) => {
  const body = await umDto.validateAsync(req.body);
  const um = await Um.findOneAndUpdate(
    {
      org: req.params.orgId,
      _id: req.params.id,
    },
    body
  );
  if (!um) throw new Error("UM not found");
  return res.status(200).json({ message: "UM updated" });
};

module.exports = update;