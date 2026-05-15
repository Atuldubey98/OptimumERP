const { RecurringInvoiceNotFound } = require("../../errors/recurringInvoice.error");
const recurringInvoiceService = require("../../services/recurringInvoice.service");

const remove = async (req, res) => {
    const filter = {
        _id: req.params.recurringInvoiceId,
        org: req.params.orgId,
    };

    const recurringInvoice = await recurringInvoiceService.remove(filter);

    if (!recurringInvoice) throw new RecurringInvoiceNotFound();

    return res.status(200).json({
        message: req.t("common:api.entity_deleted", { entity: "Recurring Invoice" }),
    });
};

module.exports = remove;
