const { isValidObjectId } = require("mongoose");
const billService = require("../../services/bill.service");
const read = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  if (!isValidObjectId(req.params.id)) throw new NotFound();
  const bill = await billService.getBill({ Bill, filter: { _id: req.params.id, org: req.params.orgId } });
  if (!bill) throw new NotFound();
  return res.status(200).json({ data: bill });
};

module.exports = read;
