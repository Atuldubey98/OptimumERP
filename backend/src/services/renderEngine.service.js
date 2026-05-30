const ejs = require("ejs");
const QRCode = require("qrcode");
const PdfMake = require("pdfmake");
const path = require("path");
const fs = require("fs/promises");
const i18 = require("../i18");
const logger = require("../logger");
const { getStoragePath } = require("../storages");

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

const toDataUri = (data, type = "image/png") => `data:${type};base64,${data.toString("base64")}`;

exports.convertPdfToImages = async (base64Content) => {
  try {
    const { pdf: pdfToImg } = require("pdf-to-img");
    const rawPdfData = base64Content.includes(",")
      ? base64Content.split(",")[1]
      : base64Content;

    const pdfBuffer = Buffer.from(rawPdfData, "base64");
    const imageList = [];
    const pages = await pdfToImg(pdfBuffer, {
      renderParams: "viewport"
    });
    let i = 1;
    for await (const page of pages) {
      logger.info(`Converting ${i} of ${pages.length}`);
      imageList.push(toDataUri(page));
      i++;
    }

    return imageList;
  } catch (error) {
    throw error;
  }
};

exports.getBase64Url = async (url) => {
  if (!url) return "";
  const filePath = getStoragePath(url);
  const buffer = await fs.readFile(filePath);
  const ext = url.split(".").pop() || "png";
  return toDataUri(buffer, `image/${ext}`);
};

exports.enrichBillDataWithImages = async (data, setting, showSignature) => {
  const orgLogoUrl = data?.entity?.org?.logo;
  if (orgLogoUrl) {
    try {
      data.entity.org.logo = await exports.getBase64Url(orgLogoUrl);
    } catch (err) {
      logger.error("Error loading logo base64:", err);
    }
  }
  if (showSignature && setting?.signature) {
    try {
      data.signature = await exports.getBase64Url(setting.signature);
    } catch (err) {
      logger.error("Error loading signature base64:", err);
    }
  }
  return data;
};
