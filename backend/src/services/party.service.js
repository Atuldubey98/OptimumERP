const { default: mongoose } = require("mongoose");
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
exports.findOne = async (params) => {
    const filter = { org: params.org };
    if (mongoose.Types.ObjectId.isValid(params.partyId)) filter._id = params.partyId;
    if (params.name) filter["$text"] = { $search: params.name };
    const party = await Party.findOne(filter).select(params?.select).lean().exec();
    return party;
}
exports.getPartiesForAI = async (query, type, orgId) => {
    const filter = { org: orgId };
    if (query) {
        filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
        ];
    }
    if (type) filter.type = type;
    return await Party.find(filter).limit(5).lean().exec();
};

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

    return await exports.create({ ...params, org: params.org });
};

exports.getLedgerTotals = async (partyId, orgId, date) => {
    const Transaction = require("../models/transaction.model");
    const match = {
        org: new mongoose.Types.ObjectId(orgId),
        party: new mongoose.Types.ObjectId(partyId),
        docModel: { $in: ["invoice", "purchase", "payment_voucher"] }
    };
    if (date) {
        match.date = date;
    }

    const aggregator = [
        { $match: match },
        {
            $lookup: {
                from: "payment_vouchers",
                localField: "doc",
                foreignField: "_id",
                as: "voucherDetails"
            }
        },
        {
            $addFields: {
                vType: { 
                    $ifNull: ["$voucherType", { $arrayElemAt: ["$voucherDetails.voucherType", 0] }] 
                }
            }
        },
        {
            $group: {
                _id: null,
                invoiceTotal: {
                    $sum: {
                        $cond: [
                            { $eq: ["$docModel", "invoice"] },
                            { $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }] },
                            0
                        ]
                    }
                },
                invoicePayment: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$docModel", "payment_voucher"] },
                                    { $eq: ["$vType", "receipt"] }
                                ]
                            },
                            "$total",
                            0
                        ]
                    }
                },
                purchaseTotal: {
                    $sum: {
                        $cond: [
                            { $eq: ["$docModel", "purchase"] },
                            { $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }] },
                            0
                        ]
                    }
                },
                purchasePayment: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$docModel", "payment_voucher"] },
                                    { $eq: ["$vType", "payment"] }
                                ]
                            },
                            "$total",
                            0
                        ]
                    }
                }
            }
        }
    ];

    const result = await Transaction.aggregate(aggregator);
    const summary = result.length > 0 ? result[0] : {
        invoiceTotal: 0,
        invoicePayment: 0,
        purchaseTotal: 0,
        purchasePayment: 0
    };

    return {
        invoiceBalance: {
            total: summary.invoiceTotal,
            payment: summary.invoicePayment
        },
        purchaseBalance: {
            total: summary.purchaseTotal,
            payment: summary.purchasePayment
        }
    };
};