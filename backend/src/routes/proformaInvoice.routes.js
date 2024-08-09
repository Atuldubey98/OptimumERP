const { Router } = require("express");
const {
  limitFreePlanOnCreateEntityForOrganization,
  checkPlan,
} = require("../middlewares/auth.middleware");
const {
  create,
  download,
  htmlView,
  nextSequence,
  paginate,
  read,
  remove,
  send,
  exportData,
  update,
  convertProformaToInvoice,
} = require("../controllers/proformaInvoice.controller");
const { updateModel, createModel } = require("../middlewares/crud.middleware");
const requestAsyncHandler = require("../handlers/requestAsync.handler");

const proformaInvoiceRouter = Router({
  mergeParams: true,
});
proformaInvoiceRouter.get("/", requestAsyncHandler(paginate));
proformaInvoiceRouter.get(
  "/nextProformaInvoiceNo",
  requestAsyncHandler(nextSequence)
);
proformaInvoiceRouter.get("/export", requestAsyncHandler(exportData));
proformaInvoiceRouter.patch("/:id", updateModel, requestAsyncHandler(update));
proformaInvoiceRouter.get("/:id", requestAsyncHandler(read));

proformaInvoiceRouter.post(
  "/:id/convertToInvoice",
  limitFreePlanOnCreateEntityForOrganization("invoices"),
  requestAsyncHandler(convertProformaToInvoice)
);
proformaInvoiceRouter.post(
  "/",
  createModel,
  limitFreePlanOnCreateEntityForOrganization("proformaInvoices"),
  requestAsyncHandler(create)
);
proformaInvoiceRouter.delete("/:id", requestAsyncHandler(remove));

proformaInvoiceRouter.get("/:id/view", requestAsyncHandler(htmlView));

proformaInvoiceRouter.get("/:id/download", requestAsyncHandler(download));
proformaInvoiceRouter.post(
  "/:id/send",
  checkPlan(["gold", "platinum"]),
  requestAsyncHandler(send)
);

module.exports = proformaInvoiceRouter;
