const { default: mongoose } = require("mongoose");
const logger = require("../logger");
const Invoice = require("../models/invoice.model");
const OrgModel = require("../models/org.model");
const Party = require("../models/party.model");
const Purchase = require("../models/purchase.model");
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
exports.findOne = async (params) => {
    const filter = { org: params.org };
    if (mongoose.Types.ObjectId.isValid(params.partyId)) filter._id = params.partyId;
    if (params.name) filter["$text"] = { $search: params.name };
    const party = await Party.findOne(filter).select(params?.select).lean().exec();
    return party;
}

exports.upsert = async (params) => {
    const filter = { org: params.org };
    
    if (mongoose.Types.ObjectId.isValid(params.partyId)) {
        filter._id = params.partyId;
    } else if (params.name) {
        filter.name = { $regex: new RegExp(`^${params.name}$`, "i") };
    }

    const existingParty = await Party.findOne(filter).lean().exec();

    if (existingParty) {
        return existingParty;
    }

    return await exports.create({ ...body, org: params.org });
};

exports.getLedgerTotals = async (partyId, orgId, date) => {
    const entities = [Invoice, Purchase];
    const match = {
        org: new mongoose.Types.ObjectId(orgId),
        party: new mongoose.Types.ObjectId(partyId),
    };
    if (date)
        match.date = date;
    const aggregator = [
        {
            $match: match,
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }],
                    },
                },
                payment: { $sum: "$payment.amount" },
            },
        },
    ];
    const [invoiceBalanceCalculator, purchaseBalanceCalculator] =
        await Promise.all(
            entities.map((model) =>
                model.aggregate(aggregator)
            )
        );
    const invoiceBalance = invoiceBalanceCalculator.length
        ? invoiceBalanceCalculator[0]
        : { total: 0, payment: 0 };
    const purchaseBalance = purchaseBalanceCalculator.length
        ? purchaseBalanceCalculator[0]
        : { total: 0, payment: 0 };
    return {
        invoiceBalance,
        purchaseBalance
    };
}