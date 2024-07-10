const { isValidObjectId } = require("mongoose");

const read = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  if (!isValidObjectId(req.params.id)) throw new NotFound();
  const bill = await Bill.findOne({
    _id: req.params.id,
    org: req.params.orgId,
  })
    .populate("party")
    .populate("createdBy", "name email ")
    .populate("updatedBy", "name email")
    .populate("org", "name address ");
  if (!bill) throw new NotFound();
  return res.status(200).json({ data: bill });
};

module.exports = read;
