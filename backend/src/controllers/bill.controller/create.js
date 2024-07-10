const { saveBill } = require("../../helpers/bill.helper");
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");

const create = async (options = {}, req, res) => {
  const { NotFound, Duplicate, dto, Bill, prefixType, relatedDocType } =
    options;
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const relatedDocTypeKey = `relatedDocsCount.${relatedDocType}`;
  const bill = await saveBill({
    Bill,
    dto,
    Duplicate,
    NotFound,
    requestBody,
    prefixType,
  });
  await OrgModel.updateOne(
    { _id: req.params.orgId },
    { $inc: { [relatedDocTypeKey]: 1 } }
  );
  logger.info(`${Bill.modelName} created ${bill.id}`);
  return res
    .status(201)
    .json({ message: `${Bill.modelName} created !`, data: bill });
};

module.exports = create;
