const { isValidObjectId } = require("mongoose");
const { getBillDetail } = require("../../services/bill.service");
const {
  getPdfBufferFromDocDefinition,
} = require("../../services/renderEngine.service");
const { getDisplaySettingForOrg } = require("../../services/setting.service");
const templator = require("../../views/templates/templator");
const https = require("https");
const logger = require("../../logger");
const fs = require("fs/promises");
const path = require("path");

const download = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const orgId = req.params.orgId;
  const setting = await getDisplaySettingForOrg(orgId);
  const template =
    req.query.template || setting?.printSettings?.defaultTemplate || "simple";
  logger.info(`Using template: ${template}`);
  const paramsColor = req.query.color || "3f51b5";
  const color = `#${paramsColor}`;
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
  const orgLogoUrl = data?.entity?.org?.logo;
  if (orgLogoUrl) {
    const logo = await getBase64Url(orgLogoUrl);
    data.entity.org.logo = logo;
  }
  const docDefinition = runner(data, color);
  const buffer = await getPdfBufferFromDocDefinition(docDefinition);
  const filename = `${data.entity.org.name}-${data.num}`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${filename}.pdf`);
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
};

module.exports = download;

async function getBase64Url(url) {
  const buffer = await fs.readFile(path.join(process.cwd(), url));
  const base64 = buffer.toString("base64");
  return `data:image/${url.split(".").pop()};base64,${base64}`;
}
