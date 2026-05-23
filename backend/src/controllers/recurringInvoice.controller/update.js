const { updateRecurringInvoiceDto } = require("../../dto/recurringInvoice.dto");
const { RecurringInvoiceNotFound } = require("../../errors/recurringInvoice.error");
const recurringInvoiceService = require("../../services/recurringInvoice.service");

const update = async (req, res) => {
    const body = await updateRecurringInvoiceDto.parseAsync(req.body);
    const filter = {
        _id: req.params.recurringInvoiceId,
        org: req.params.orgId,
    };
    body.updatedBy = req.session.user._id;

    const recurringInvoice = await recurringInvoiceService.update(filter, body);

    if (!recurringInvoice) throw new RecurringInvoiceNotFound();

    return res.status(200).json({
        data: recurringInvoice,
        message: req.t("common:api.entity_updated", { entity: "Recurring Invoice" }),
    });
};

module.exports = update;
