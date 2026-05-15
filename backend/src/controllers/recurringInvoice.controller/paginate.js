const recurringInvoiceService = require("../../services/recurringInvoice.service");
const { hasUserReachedCreationLimits } = require("../../services/crud.service");

const paginate = async (req, res) => {
    const query = req.query;
    const params = req.params;

    const result = await recurringInvoiceService.paginate({ query, params });

    return res.status(200).json({
        ...result,
        reachedLimit: hasUserReachedCreationLimits({
            relatedDocsCount: res.locals.organization.relatedDocsCount,
            userLimits: req.session.user.limits,
            key: "recurringInvoices",
        }),
    });
};

module.exports = paginate;
