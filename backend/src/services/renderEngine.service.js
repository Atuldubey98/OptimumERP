const ejs = require("ejs");
const QRCode = require("qrcode");
const fetch = require("node-fetch");
exports.renderHtml = (location, data) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(location, data, (err, html) => {
      if (err) reject(err);
      resolve(html);
    });
  });
};

exports.sendHtmlToPdfResponse = async ({ html, res, pdfName }) => {
  const pdfBuffer = await this.getPdfBufferUsingHtml(html);
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
exports.getPdfBufferUsingHtml = async (html) => {
  const apiKey = process.env.PDF_SHIFT_API_KEY;

  const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(apiKey).toString("base64"),
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      source: html,
    }),
  });
  if (!response.ok) throw new Error("Pdf generation failed");
  const buffer = await response.buffer();
  return buffer;
};
