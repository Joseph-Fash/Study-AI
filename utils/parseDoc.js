const fs = require("fs");
const mammoth = require("mammoth");
const PDFParser = require("pdf2json");

async function extractText(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    return new Promise((resolve, reject) => {
      const parser = new PDFParser();
      parser.on("pdfParser_dataReady", (data) => {
        const text = data.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" "),
        ).join("\n");
        resolve(text);
      });
      parser.on("pdfParser_dataError", reject);
      parser.loadPDF(filePath);
    });
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg" ||
    mimeType === "image/png"
  ) {
    return "IMAGE:" + filePath;
  }

  return null;
}

module.exports = { extractText };
