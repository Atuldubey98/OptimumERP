const { isValidObjectId } = require("mongoose");
const { getBillDetail } = require("../../services/bill.service");
const {
  getPdfBufferFromDocDefinition,
  enrichBillDataWithImages,
} = require("../../services/renderEngine.service");
const { getDisplaySettingForOrg } = require("../../services/setting.service");
const templator = require("../../views/templates/templator");
const logger = require("../../logger");

const download = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const orgId = req.params.orgId;
  const setting = await getDisplaySettingForOrg(orgId);
  const template =
    req.query.template || setting?.printSettings?.defaultTemplate || "simple";
  logger.info(`Using template: ${template}`);
  const color = req.query.color ? `#${req.query.color.replace(/^#/, "")}` : null;
  const filter = {
    _id: id,
    org: orgId,
  };
  const language = req.query.lng || req.language;
  const t = language && req.i18n
    ? (key, options = {}) => req.i18n.t(key, { ...options, lng: language })
    : req.t;
  let data = await getBillDetail({
    Bill,
    filter,
    NotFound,
    t,
    language,
  });
  const runner = templator(template);
  await enrichBillDataWithImages(data, setting, req.query.signature === "true");
  const docDefinition = runner(data, color);
  const buffer = await getPdfBufferFromDocDefinition(docDefinition);
  const filename = `${data.entity.org.name}-${data.num}`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${filename}.pdf`);
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
};

module.exports = download;
