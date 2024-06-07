const ejs = require("ejs");
const wkhtmltopdf = require("wkhtmltopdf");
const QRCode = require("qrcode");

exports.renderHtml = (location, data) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(location, data, (err, html) => {
      if (err) reject(err);
      resolve(html);
    });
  });
};

exports.sendHtmlToPdfResponse = ({ html, res, pdfName }) => {
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-disposition": `attachment;filename=${pdfName}`,
  });
  return wkhtmltopdf(html, {
    enableLocalFileAccess: true,
    pageSize: "A4",
  }).pipe(res);
};

exports.promiseQrCode = (value) => {
  return new Promise((res, rej) => {
    QRCode.toDataURL(value, function (err, url) {
      if (err) rej(err);
      res(url);
    });
  });
};

exports.sendExcelBufferResponse = ({ excelBuffer, fileName, res }) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${fileName}`
  );
  res.setHeader("Content-Length", excelBuffer.length);
  res.send(excelBuffer);
};
