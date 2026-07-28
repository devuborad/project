class ContextBuilderService {
  /**
   * Converts raw database rows and intent into natural language context block.
   */
  buildContext(intent, entities, dbRows) {
    if (!dbRows || dbRows.length === 0) {
      if (intent === 'attendance') {
        return `CRITICAL INSTRUCTION: The user is asking about their attendance, but the database returned 0 results. You MUST respond EXACTLY with: "No attendance records were found for your account." DO NOT say you do not have access.`;
      }
      return `Database returned 0 results for intent: ${intent}. Inform the user that no matching records were found.`;
    }

    let contextText = `Student requested information about: ${intent.toUpperCase()}.\n`;
    contextText += `Extracted Entities: ${JSON.stringify(entities)}\n\n`;
    contextText += `=== DATABASE RESULTS ===\n`;

    // Map rows into clean text
    if (intent === 'attendance' && dbRows.length === 1 && dbRows[0].context) {
      contextText += dbRows[0].context + '\n';
    } else {
      dbRows.forEach((row, idx) => {
        let line = `${idx + 1}. `;
        for (const [key, value] of Object.entries(row)) {
          line += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} | `;
        }
        contextText += line + '\n';
      });
    }

    contextText += `\n========================\n`;
    contextText += `Instructions: Use the strictly provided database results above to answer the user's question. Do not hallucinate data. Be conversational, helpful, and concise.`;
    
    if (intent === 'attendance') {
      contextText += `\nCRITICAL INSTRUCTION: You now have the user's attendance data. DO NOT say you don't have access. DO NOT ask them to check a portal. Provide the answer naturally based on the data above.`;
    }

    return contextText;
  }

  /**
   * Generates a nicely formatted Markdown response directly from database rows.
   * This is used when needs_gemini is false.
   */
  buildNaturalResponse(intent, entities, dbRows) {
    if (!dbRows || dbRows.length === 0) {
      return `I couldn't find any records for ${intent} matching your request.`;
    }

    let response = `Here is what I found for **${intent}**:\n\n`;
    
    // Build a markdown table
    const headers = Object.keys(dbRows[0]);
    response += `| ${headers.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(' | ')} |\n`;
    response += `| ${headers.map(() => '---').join(' | ')} |\n`;

    dbRows.forEach(row => {
      response += `| ${headers.map(h => row[h]).join(' | ')} |\n`;
    });

    return response;
  }
}

module.exports = new ContextBuilderService();
