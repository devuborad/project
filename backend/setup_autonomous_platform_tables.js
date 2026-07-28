require('dotenv').config();
const db = require('./config/db');

async function setupAutonomousPlatformTables() {
  try {
    console.log('Connecting to MySQL to create Autonomous AI Platform tables...');

    // 1. ai_memory
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ai_memory (
        user_id INT PRIMARY KEY,
        student_name VARCHAR(150) NULL,
        department VARCHAR(100) NULL,
        semester VARCHAR(50) NULL,
        recent_chats_json JSON NULL,
        uploaded_notes_count INT DEFAULT 0,
        study_habits TEXT NULL,
        quiz_history_json JSON NULL,
        weak_topics_json JSON NULL,
        preferred_learning_style VARCHAR(100) DEFAULT 'Visual & Examples',
        frequently_asked_questions_json JSON NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created ai_memory table');

    // 2. embeddings (RAG Knowledge Base)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        user_id INT NOT NULL,
        chunk_index INT NOT NULL,
        chunk_text TEXT NOT NULL,
        embedding_vector JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_note (user_id, note_id),
        FOREIGN KEY (note_id) REFERENCES uploaded_notes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created embeddings table');

    // 3. workflow_logs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workflow_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workflow_name VARCHAR(150) NOT NULL,
        trigger_type VARCHAR(100) NOT NULL,
        user_id INT NULL,
        status VARCHAR(50) DEFAULT 'success',
        details_json JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created workflow_logs table');

    // 4. notifications
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        data_json JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read (user_id, is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created notifications table');

    // 5. analytics
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value VARCHAR(255) NOT NULL,
        recorded_date DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created analytics table');

    // 6. study_statistics
    await db.execute(`
      CREATE TABLE IF NOT EXISTS study_statistics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        total_study_hours INT DEFAULT 0,
        weekly_progress_percent INT DEFAULT 0,
        attendance_trend_percent INT DEFAULT 85,
        completed_assignments INT DEFAULT 0,
        generated_quizzes INT DEFAULT 0,
        pdf_upload_count INT DEFAULT 0,
        ai_conversations INT DEFAULT 0,
        weak_subjects_json JSON NULL,
        recommended_topics_json JSON NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created study_statistics table');

    // 7. agent_execution_logs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS agent_execution_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        agent_name VARCHAR(150) NOT NULL,
        prompt TEXT NOT NULL,
        response_text TEXT NULL,
        execution_time_ms INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created agent_execution_logs table');

    console.log('🚀 All Autonomous AI Agent Platform tables set up successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Autonomous AI Platform tables:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupAutonomousPlatformTables();
}

module.exports = { setupAutonomousPlatformTables };
