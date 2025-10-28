// Frontend/elios_FE/src/cvGenerator/utils/exportToPDF.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export a DOM element or a base64 canvas image to PDF.
 * @param {string|HTMLCanvasElement} target - The element ID or base64 image.
 * @param {string} filename - The output PDF name.
 * @param {boolean} isBase64 - If true, treat target as base64 image data.
 */
export async function exportToPDF(target, filename = "my_cv.pdf", isBase64 = false) {
  const pdf = new jsPDF("p", "mm", "a4");

  if (isBase64) {
    // Handle Konva's stage.toDataURL
    pdf.addImage(target, "PNG", 0, 0, 210, 297);
  } else {
    // Capture a DOM element
    const element = typeof target === "string" ? document.getElementById(target) : target;
    if (!element) {
      console.error(`Element "${target}" not found.`);
      return;
    }

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
  }

  pdf.save(filename);
}
