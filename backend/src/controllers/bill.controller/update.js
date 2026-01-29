const { isValidObjectId } = require("mongoose");
const logger = require("../../logger");
const { saveBill } = require("../../services/bill.service");
const billTypes = require("../../constants/billTypes");

const update = async (options = {}, req, res) => {
  const { NotFound, Duplicate, dto, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const bill = await saveBill({
    Bill,
    dto,
    Duplicate,
    NotFound: NotFound,
    requestBody,
    prefixType: "invoice",
    billId: req.params.id,
  });
  logger.info(`${Bill.modelName} updated ${bill.id}`);
  const billLabel = billTypes[Bill.modelName] || Bill.modelName;
  const message = `${billLabel} updated successfully`;
  return res.status(200).json({ message });
};

module.exports = update;
