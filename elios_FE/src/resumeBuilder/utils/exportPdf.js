// file: elios_FE/src/resumeBuilder/utils/exportPdf.js
import html2pdf from 'html2pdf.js';

/**
 * Exports the specified HTML element to a PDF file.
 * @param {string} elementId - The ID of the HTML element to export.
 * @param {string} fileName - The desired name for the output PDF file.
 */
const exportToPdf = (elementId, fileName = 'resume.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  const opt = {
    margin:       0.5,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};

export default exportToPdf;