const { saveBill, pluckRelevantFields } = require("../../services/bill.service");
const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const billTypes = require("../../constants/billTypes");
const logService = require("../../services/log.service");

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
    
    await logService.recordActivity({
      org: req.params.orgId,
      user: req.session.user._id,
      docModel: prefixType, // e.g., 'invoice'
      doc: bill._id,
      action: "created",
      message: `${billTypes[Bill.modelName] || Bill.modelName} created by ${req.session.user.name}`,
      session
    });

    await logService.recordAudit({
      org: req.params.orgId,
      user: req.session.user._id,
      docModel: prefixType,
      doc: bill._id,
      action: "created",
      changes: pluckRelevantFields(bill),
      session
    });

    logger.info(`${Bill.modelName} created ${bill.id}`);
  });
  const billLabel = billTypes[Bill.modelName] || Bill.modelName;  
  logger.info(`${billLabel} created successfully`);
  return res
    .status(201)
    .json({
      message: req.t("common:api.entity_created", { entity: billLabel }),
    });
};

module.exports = create;
