const officeParser = require('officeparser');

/**
 * Extracts raw text from a document buffer (PDF, DOCX, PPTX).
 * @param {Buffer} buffer - The file buffer.
 * @param {string} originalName - The original file name to determine type.
 * @returns {Promise<string>} The extracted text.
 */
const extractTextFromDocument = async (buffer, originalName) => {
  try {
    const ext = originalName.split('.').pop().toLowerCase();
    
    if (ext === 'txt') {
      return buffer.toString('utf-8');
    }

    // Use officeparser to parse from buffer
    const text = await officeParser.parseOfficeAsync(buffer);
    if (!text || text.trim() === '') {
      throw new Error('Document appears to be empty or non-extractable.');
    }
    return text;
  } catch (error) {
    console.error('[Document Extractor] Error parsing document:', error);
    throw new Error('Failed to extract text from document. Ensure it is not corrupted or password protected.');
  }
};

module.exports = { extractTextFromDocument };
