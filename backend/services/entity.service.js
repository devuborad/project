class EntityService {
  /**
   * Sanitizes and formats extracted entities for safer DB querying.
   */
  sanitizeEntities(entities) {
    const sanitized = {};
    if (!entities) return sanitized;

    for (const [key, value] of Object.entries(entities)) {
      if (typeof value === 'string' && value.trim() !== '') {
        // Basic sanitization: trim, and handle common formats
        let cleanValue = value.trim();
        
        // E.g., if semester is "Sem 3" or "3rd semester", just extract the number
        if (key === 'semester' && cleanValue.match(/\d+/)) {
          cleanValue = cleanValue.match(/\d+/)[0];
        }

        sanitized[key] = cleanValue;
      }
    }
    return sanitized;
  }
}

module.exports = new EntityService();
