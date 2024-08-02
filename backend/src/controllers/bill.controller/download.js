const { isValidObjectId } = require("mongoose");
const {
  convertBillToHtmlByTemplate,
} = require("../../services/bill.service");
const {
  sendHtmlToPdfResponse,
} = require("../../services/renderEngine.service");

const download = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const orgId = req.params.orgId;
  const template = req.query.template || "simple";
  const filter = {
    _id: id,
    org: orgId,
  };
  const { html, data } = await convertBillToHtmlByTemplate({
    Bill,
    filter,
    NotFound,
    template,
  });
  await sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `${Bill.modelName}-${data.num}-${data.date}.pdf`,
  });
};

module.exports = download;
