const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer.
 * @param {Buffer} buffer - The file buffer.
 * @returns {Promise<string>} The extracted text.
 */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    if (!data || !data.text || data.text.trim() === '') {
      throw new Error('PDF appears to be empty or non-extractable (possibly an image-based PDF).');
    }
    return data.text;
  } catch (error) {
    console.error('[PDF Extractor] Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF. Ensure the file is not corrupted or password protected.');
  }
};

module.exports = { extractTextFromPDF };
