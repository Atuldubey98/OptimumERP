const ejs = require("ejs");
const QRCode = require("qrcode");
const fetch = require("node-fetch");
const PdfMake = require("pdfmake");
const path = require("path");
const i18 = require("../i18");
const logger = require("../logger");
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
  try {
    const apiKey = process.env.PDF_SHIFT_API_KEY;
    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(apiKey).toString("base64"),
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        source: html,
      }),
    });
    if (!response.ok)
      throw new Error(i18.t("common:common.pdf_generation_failed"));
    const buffer = await response.buffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};

exports.getPdfBufferFromDocDefinition = async (docDefinition) => {
  const getPathForFonts = (filename) => {
    return path.join(__dirname, "..", "..", "public", "fonts", filename);
  };
  return new Promise((resolve, reject) => {
    const pdfmake = new PdfMake({
      Roboto: {
        normal: getPathForFonts("Roboto-Regular.ttf"),
        bold: getPathForFonts("Roboto-Medium.ttf"),
        italics: getPathForFonts("Roboto-Italic.ttf"),
        bolditalics: getPathForFonts("Roboto-MediumItalic.ttf"),
      },
      NotoSans: {
        normal: getPathForFonts("NotoSans-Regular.ttf"),
        bold: getPathForFonts("NotoSans-Bold.ttf"),
        italics: getPathForFonts("NotoSans-Regular.ttf"),
        bolditalics: getPathForFonts("NotoSans-Bold.ttf"),
      },
      NotoSansArabic: {
        normal: getPathForFonts("NotoSansArabic-Regular.ttf"),
        bold: getPathForFonts("NotoSansArabic-Bold.ttf"),
        italics: getPathForFonts("NotoSansArabic-Regular.ttf"),
        bolditalics: getPathForFonts("NotoSansArabic-Bold.ttf"),
      },
      NotoSansBengali: {
        normal: getPathForFonts("NotoSansBengali-Regular.ttf"),
        bold: getPathForFonts("NotoSansBengali-Bold.ttf"),
        italics: getPathForFonts("NotoSansBengali-Regular.ttf"),
        bolditalics: getPathForFonts("NotoSansBengali-Bold.ttf"),
      },
      NotoSansJP: {
        normal: getPathForFonts("NotoSansJP-Regular.ttf"),
        bold: getPathForFonts("NotoSansJP-Bold.ttf"),
        italics: getPathForFonts("NotoSansJP-Regular.ttf"),
        bolditalics: getPathForFonts("NotoSansJP-Bold.ttf"),
      },
    });
    const printer = pdfmake.createPdfKitDocument(docDefinition);
    const chunks = [];
    const onNewPdfChunk = (chunk) => {
      chunks.push(chunk);
    };
    printer.on("data", onNewPdfChunk);
    const onEndPdfChunks = () => {
      resolve(Buffer.concat(chunks));
    };
    printer.on("end", onEndPdfChunks);
    const onErrorInChunking = () => {
      reject(new Error(i18.t("common:common.some_error_occurred")));
    };
    printer.on("error", onErrorInChunking);
    printer.end();
  });
};

exports.convertPdfToImages = async (base64Content) => {
  try {
    const { pdf: pdfToImg } = require("pdf-to-img");
    const rawPdfData = base64Content.includes(",")
      ? base64Content.split(",")[1]
      : base64Content;

    const pdfBuffer = Buffer.from(rawPdfData, "base64");
    const imageList = [];
    const pages = await pdfToImg(pdfBuffer,{
      renderParams : "viewport"
    });
    let i = 1;
    for await (const page of pages) {
      logger.info(`Converting ${i} of ${pages.length}`);
      imageList.push(page.toString("base64"));
    }

    return imageList;
  } catch (error) {
    throw error;
  }
};
