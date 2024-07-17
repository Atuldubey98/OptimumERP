const { getNextSequence } = require("../../services/bill.service");
const Quotes = require("../../models/quotes.model");

const nextSequence = async (req, res) => {
  const nextSequence = await getNextSequence({
    org: req.params.orgId,
    Bill: Quotes,
  });
  return res.status(200).json({ data: nextSequence });
};

module.exports = nextSequence;
