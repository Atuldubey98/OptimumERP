const { getNextSequence } = require("../../services/bill.service");
const Invoice = require("../../models/invoice.model");

const nextSequence = async (req, res) => {
  const nextSequence = await getNextSequence({
    Bill: Invoice,
    org: req.params.orgId,
  });
  return res.status(200).json({ data: nextSequence });
};

module.exports = nextSequence;
