const { isValidObjectId } = require("mongoose");
const logger = require("../../logger");
const { deleteBill } = require("../../services/bill.service");

const billTypes = require("../../constants/billTypes");

const remove = async (options = {}, req, res) => {
  const { NotFound, Bill, relatedDocType } = options;
  const relatedDocTypeKey = `relatedDocsCount.${relatedDocType}`;

  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const bill = await deleteBill({
    Bill,
    NotFound,
    filter,
    relatedDocTypeKey,
  });
  logger.info(`${Bill.modelName} deleted ${bill.id}`);
  const billLabel = billTypes[Bill.modelName] || Bill.modelName;
  return res.status(200).json({
    message: req.t("common:api.entity_deleted", { entity: billLabel }),
  });

};

module.exports = remove;
