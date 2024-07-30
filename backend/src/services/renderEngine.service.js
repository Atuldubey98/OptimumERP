const ejs = require("ejs");
const QRCode = require("qrcode");
const puppeteer = require("puppeteer");
exports.renderHtml = (location, data) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(location, data, (err, html) => {
      if (err) reject(err);
      resolve(html);
    });
  });
};


exports.sendHtmlToPdfResponse = async ({ html, res, pdfName }) => {
  const pdfBuffer = await getPdfBufferUsingHtml(html);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${pdfName}.pdf`);
  res.setHeader("Content-Length", pdfBuffer.length);
  return res.send(pdfBuffer);
};

exports.promiseQrCode = (value) => {
  return new Promise((res, rej) => {
    QRCode.toDataURL(value, function (err, url) {
      if (err) rej(err);
      res(url);
    });
  });
};

async function getPdfBufferUsingHtml(html) {
  const browser = await puppeteer.launch();
  const urlPage = await browser.newPage();
  await urlPage.setContent(html);
  const MARGIN = "0.5cm";
  const buffer = await urlPage.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      bottom: MARGIN,
      top: MARGIN,
      right: MARGIN,
      left: MARGIN,
    },
  });
  return buffer;
}
