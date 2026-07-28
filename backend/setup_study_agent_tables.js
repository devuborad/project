require('dotenv').config();
const db = require('./config/db');

async function setupStudyAgentTables() {
  try {
    console.log('Connecting to MySQL to create Study Agent tables...');

    // 1. uploaded_notes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT DEFAULT 0,
        extracted_text LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created uploaded_notes table');

    // 2. study_summaries
    await db.execute(`
      CREATE TABLE IF NOT EXISTS study_summaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        user_id INT NOT NULL,
        summary_text TEXT,
        key_points JSON,
        definitions JSON,
        interview_questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES uploaded_notes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created study_summaries table');

    // 3. generated_quizzes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS generated_quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        user_id INT NOT NULL,
        questions_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES uploaded_notes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created generated_quizzes table');

    // 4. flashcards
    await db.execute(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        user_id INT NOT NULL,
        cards_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES uploaded_notes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created flashcards table');

    // 5. study_agent_chats
    await db.execute(`
      CREATE TABLE IF NOT EXISTS study_agent_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created study_agent_chats table');

    console.log('🎉 All Study Agent database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Study Agent tables:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupStudyAgentTables().then(() => process.exit(0));
}

module.exports = { setupStudyAgentTables };
