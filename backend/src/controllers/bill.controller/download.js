const { isValidObjectId } = require("mongoose");
const { getBillDetail } = require("../../services/bill.service");
const {
  getPdfBufferFromDocDefinition,
} = require("../../services/renderEngine.service");
const templator = require("../../views/templates/templator");
const https = require("https");
const Setting = require("../../models/settings.model");
const logger = require("../../logger");
const fs = require("fs/promises");
const path = require("path");

const download = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const orgId = req.params.orgId;
  const setting = await Setting.findOne(
    { org: orgId },
    { "printSettings.defaultTemplate": 1 },
  );
  const template =
    req.query.template || setting?.printSettings?.defaultTemplate;
  logger.info(`Using template: ${template}`);
  const paramsColor = req.query.color || "3f51b5";
  const color = `#${paramsColor}`;
  const filter = {
    _id: id,
    org: orgId,
  };
  let data = await getBillDetail({
    Bill,
    filter,
    NotFound,
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
  if (url.startsWith("http")) {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = [];

          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            const buffer = Buffer.concat(data);
            const base64 = buffer.toString("base64");
            const contentType = res.headers["content-type"];
            const base64Url = `data:${contentType};base64,${base64}`;
            resolve(base64Url);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }
  const buffer = await fs.readFile(path.resolve(__dirname, "../../../", url));
  const base64 = buffer.toString("base64");
  return `data:image/${url.split(".").pop()};base64,${base64}`;
}
