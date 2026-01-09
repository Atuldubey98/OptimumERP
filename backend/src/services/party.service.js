const logger = require("../logger");
const OrgModel = require("../models/org.model");
const Party = require("../models/party.model");
const { executeMongoDbTransaction } = require("./crud.service");

exports.create = async (body) => {
    const newParty = await executeMongoDbTransaction(async (session) => {
        const party = new Party(body);
        await party.save({ session });
        await OrgModel.updateOne(
            { _id: party.org },
            { $inc: { "relatedDocsCount.parties": 1 } },
            { session }
        );
        logger.info(`created party ${party.id}`);
        return party;
    });
    return newParty;
}