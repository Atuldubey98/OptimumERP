const { isValidObjectId } = require("mongoose");
const { getBillDetail } = require("../../services/bill.service");
const {
  sendHtmlToPdfResponse,
  renderHtml,
} = require("../../services/renderEngine.service");
const path = require("path");
const download = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  const template = req.query.template || "simple";
  const data = await getBillDetail({
    Bill,
    filter,
    NotFound,
  });
  const pdfTemplateLocation = path.join(
    __dirname,
    `../../views/templates/${template}/index.ejs`
  );
  const html = await renderHtml(pdfTemplateLocation, data);
  sendHtmlToPdfResponse({
    html,
    res,
    pdfName: `${Bill.modelName}-${data.num}-${data.date}.pdf`,
  });
};

module.exports = download;
