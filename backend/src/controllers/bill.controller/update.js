const { isValidObjectId } = require("mongoose");
const logger = require("../../logger");
const { saveBill, pluckRelevantFields } = require("../../services/bill.service");
const billTypes = require("../../constants/billTypes");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const logService = require("../../services/log.service");


const update = async (options = {}, req, res) => {
  const { NotFound, Duplicate, dto, Bill, prefixType } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const requestBody = req.body;
  requestBody.org = req.params.orgId;
  const bill = await executeMongoDbTransaction(async (session) => {
    const updatedBill = await saveBill({
      Bill,
      dto,
      Duplicate,
      NotFound: NotFound,
      requestBody,
      prefixType,
      billId: req.params.id,
      session,
    });
    
    await logService.recordActivity({
      org: req.params.orgId,
      user: req.session.user._id,
      docModel: prefixType,
      doc: updatedBill._id,
      action: "updated",
      message: `${billTypes[Bill.modelName] || Bill.modelName} updated by ${req.session.user.name}`,
      session
    });

    await logService.recordAudit({
      org: req.params.orgId,
      user: req.session.user._id,
      docModel: prefixType,
      doc: updatedBill._id,
      action: "updated",
      changes: pluckRelevantFields(updatedBill),
      session
    });

    logger.info(`${Bill.modelName} updated ${updatedBill.id}`);
    return updatedBill;
  });

  const billLabel = billTypes[Bill.modelName] || Bill.modelName;
  const message = req.t("common:api.entity_updated", { entity: billLabel });
  return res.status(200).json({ message });
};

module.exports = update;
