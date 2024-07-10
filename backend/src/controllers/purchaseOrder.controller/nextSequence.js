const { getNextSequence } = require("../../helpers/bill.helper");
const PurchaseOrder = require("../../models/purchaseOrder.model");

const nextSequence = async (req, res) => {
  const nextSequence = await getNextSequence({
    org: req.params.orgId,
    Bill: PurchaseOrder,
  });
  return res.status(200).json({ data: nextSequence });
};

module.exports = nextSequence;
