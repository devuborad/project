class ContextBuilderService {
  /**
   * Converts raw database rows and intent into natural language context block.
   */
  buildContext(intent, entities, dbRows) {
    if (!dbRows || dbRows.length === 0) {
      return `Database returned 0 results for intent: ${intent}. Inform the user that no matching records were found.`;
    }

    let contextText = `Student requested information about: ${intent.toUpperCase()}.\n`;
    contextText += `Extracted Entities: ${JSON.stringify(entities)}\n\n`;
    contextText += `=== DATABASE RESULTS ===\n`;

    // Map rows into clean text
    dbRows.forEach((row, idx) => {
      let line = `${idx + 1}. `;
      for (const [key, value] of Object.entries(row)) {
        line += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} | `;
      }
      contextText += line + '\n';
    });

    contextText += `\n========================\n`;
    contextText += `Instructions: Use the strictly provided database results above to answer the user's question. Do not hallucinate data. Be conversational, helpful, and concise.`;

    return contextText;
  }
}

module.exports = new ContextBuilderService();
