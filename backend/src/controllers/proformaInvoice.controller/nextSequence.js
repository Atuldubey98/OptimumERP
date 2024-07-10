const { getNextSequence } = require("../../helpers/bill.helper");
const ProformaInvoice = require("../../models/proformaInvoice.model");

const nextSequence = async (req, res) => {
  const nextSequence = await getNextSequence({
    Bill: ProformaInvoice,
    org: req.params.orgId,
  });
  return res.status(200).json({ data: nextSequence });
};

module.exports = nextSequence;
