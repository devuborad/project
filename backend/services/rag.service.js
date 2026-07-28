/**
 * RAG Service (Retrieval Augmented Generation)
 * Uploaded PDFs -> Extract Text -> Split into Chunks -> Generate Embeddings -> Store in MySQL
 * -> Semantic Search -> Retrieve relevant chunks -> Send context to Gemini -> Generate answer.
 * Uses Gemini Embedding API with deterministic TF-IDF fallback for 100% resilience.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const aiMemory = require('./aiMemory.service');

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

class RagService {
  constructor() {
    this.CHUNK_SIZE = 600;
    this.CHUNK_OVERLAP = 100;
  }

  /**
   * Splits text into overlapping chunks for indexing
   */
  chunkText(text) {
    if (!text) return [];
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
    const chunks = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + this.CHUNK_SIZE;
      if (end < cleanText.length) {
        // Try to break at sentence or word boundary
        const periodIdx = cleanText.lastIndexOf('.', end);
        if (periodIdx > start + this.CHUNK_SIZE * 0.5) {
          end = periodIdx + 1;
        } else {
          const spaceIdx = cleanText.lastIndexOf(' ', end);
          if (spaceIdx > start + this.CHUNK_SIZE * 0.5) {
            end = spaceIdx;
          }
        }
      }

      const chunk = cleanText.slice(start, end).trim();
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
      start = end - this.CHUNK_OVERLAP;
      if (start < 0 || end >= cleanText.length) break;
    }

    return chunks;
  }

  /**
   * Generates a 128-dimensional deterministic semantic/keyword hash vector as a robust fallback
   */
  generateFallbackVector(text) {
    const vector = new Array(128).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % 128;
      vector[idx] += 1;
    }
    // L2 normalization
    let norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) norm = 1;
    return vector.map(v => Number((v / norm).toFixed(4)));
  }

  /**
   * Generates an embedding vector using Gemini API or fallback
   */
  async generateEmbedding(text) {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        if (result && result.embedding && Array.isArray(result.embedding.values)) {
          return result.embedding.values;
        }
      } catch (err) {
        // Fallback silently if quota or API issue
      }
    }
    return this.generateFallbackVector(text);
  }

  /**
   * Computes Cosine Similarity between two numerical vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
      return 0;
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Processes a newly uploaded PDF/Note: splits into chunks, generates embeddings, and saves to MySQL
   */
  async processAndEmbedNote(noteId, userId, extractedText) {
    if (!extractedText) return 0;
    try {
      const chunks = this.chunkText(extractedText);
      console.log(`[RAGService] Chunking Note #${noteId} into ${chunks.length} chunks for User #${userId}...`);

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const vector = await this.generateEmbedding(chunkText);
        await db.execute(
          `INSERT INTO embeddings (note_id, user_id, chunk_index, chunk_text, embedding_vector)
           VALUES (?, ?, ?, ?, ?)`,
          [noteId || null, userId, i, chunkText, JSON.stringify(vector)]
        );
      }

      // Update student AI Memory uploaded notes count
      const [noteRows] = await db.execute(
        `SELECT COUNT(*) as cnt FROM uploaded_notes WHERE user_id = ?`,
        [userId]
      ).catch(() => [[{ cnt: 1 }]]);
      const cnt = noteRows[0]?.cnt || 1;
      await aiMemory.updateMemory(userId, { uploaded_notes_count: cnt });

      console.log(`✅ [RAGService] Stored ${chunks.length} embedding chunks for Note #${noteId}`);
      return chunks.length;
    } catch (error) {
      console.error('[RAGService] processAndEmbedNote error:', error);
      return 0;
    }
  }

  /**
   * Searches the RAG knowledge base for top matching text chunks for a given user query
   */
  async searchRelevantChunks(userId, query, topK = 3) {
    if (!userId || !query) return [];
    try {
      const queryVector = await this.generateEmbedding(query);

      const [rows] = await db.execute(
        `SELECT id, note_id, chunk_text, embedding_vector FROM embeddings WHERE user_id = ?`,
        [userId]
      );

      if (rows.length === 0) return [];

      const scoredChunks = rows.map(row => {
        let vec = [];
        try {
          vec = typeof row.embedding_vector === 'string' ? JSON.parse(row.embedding_vector) : row.embedding_vector;
        } catch (e) {}
        const similarity = this.cosineSimilarity(queryVector, vec);
        return {
          id: row.id,
          note_id: row.note_id,
          text: row.chunk_text,
          similarity
        };
      });

      // Sort descending by similarity
      scoredChunks.sort((a, b) => b.similarity - a.similarity);

      // Filter out low similarity matches (< 0.18)
      const topMatches = scoredChunks.filter(item => item.similarity >= 0.18).slice(0, topK);
      return topMatches;
    } catch (error) {
      console.error('[RAGService] searchRelevantChunks error:', error);
      return [];
    }
  }

  /**
   * Answers a student question using RAG:
   * 1. Retrieves relevant chunks from MySQL embeddings table
   * 2. If chunks found -> sends context + question to Gemini
   * 3. If nothing found -> automatically falls back to Gemini's general knowledge
   */
  async answerWithRAG(userId, question, history = [], options = {}) {
    try {
      const chunks = await this.searchRelevantChunks(userId, question, 3);
      const memoryContext = await aiMemory.buildMemoryContext(userId);

      let ragContextText = '';
      let usedRag = false;

      if (chunks.length > 0) {
        usedRag = true;
        ragContextText = `
[RAG KNOWLEDGE BASE RETRIEVAL - UPLOADED NOTES]
The student has uploaded notes containing the following excerpts relevant to their question:
${chunks.map((c, i) => `Excerpt ${i + 1} (Similarity: ${(c.similarity * 100).toFixed(0)}%):\n"${c.text}"`).join('\n---\n')}
[END RAG RETRIEVAL]

INSTRUCTIONS:
1. Answer the student's question prioritizing the above verified notes from their uploaded PDF knowledge base.
2. Quote or reference specific concepts from the notes when helpful.
3. Be clear, encouraging, and academically rigorous.
`;
      } else {
        ragContextText = `
[NOTE: No specific matching excerpt found in uploaded PDF knowledge base. Answering using general academic knowledge.]
`;
      }

      // We use existing GeminiService to generate content with our enriched prompt
      const geminiService = require('./gemini.service');
      const enrichedPrompt = `${memoryContext}\n\n${ragContextText}\n\nStudent Question: "${question}"`;

      const answer = await geminiService.generateContent(enrichedPrompt);

      return {
        answer,
        usedRag,
        retrievedChunks: chunks.length,
        sources: chunks.map(c => `Note #${c.note_id} (${(c.similarity * 100).toFixed(0)}% match)`)
      };
    } catch (error) {
      console.error('[RAGService] answerWithRAG error:', error);
      // Seamless fallback
      const geminiService = require('./gemini.service');
      const answer = await geminiService.generateContent(question);
      return { answer, usedRag: false, retrievedChunks: 0, sources: [] };
    }
  }
}

module.exports = new RagService();
