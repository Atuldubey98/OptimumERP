const ejs = require("ejs");
const QRCode = require("qrcode");
const puppeteer = require("puppeteer-core");

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
  res.setHeader(
    "Content-Type",
    "application/pdf"
  );
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
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: `/usr/bin/chromium-browser`,
  });
  const urlPage = await browser.newPage();
  await urlPage.setContent(html);
  const buffer = await urlPage.pdf({
    format: "A4",
    printBackground: true,
  });
  await urlPage.clo;
  await browser.close();
  return buffer;
}
