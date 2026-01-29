const { saveBill } = require("../../services/bill.service");
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const billTypes = require("../../constants/billTypes");

const create = async (options = {}, req, res) => {
  const { NotFound, Duplicate, dto, Bill, prefixType, relatedDocType } =
    options;
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const relatedDocTypeKey = `relatedDocsCount.${relatedDocType}`;
  await executeMongoDbTransaction(async (session) => {
    const bill = await saveBill({
      Bill,
      dto,
      Duplicate,
      NotFound,
      requestBody,
      prefixType,
      session,
    });
    await OrgModel.updateOne(
      { _id: req.params.orgId },
      { $inc: { [relatedDocTypeKey]: 1 } }
    ).session(session);
    logger.info(`${Bill.modelName} created ${bill.id}`);
  });
  const billLabel = billTypes[Bill.modelName] || Bill.modelName;  
  logger.info(`${billLabel} created successfully`);
  return res
    .status(201)
    .json({ message: `${billLabel} created successfully !` });
};

module.exports = create;
