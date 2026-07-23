require('dotenv').config();
const db = require('./config/db');

async function setup() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS resume_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        resume_url VARCHAR(500),
        ats_score INT DEFAULT 0,
        analysis_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await db.execute(query);
    console.log('✅ Successfully created resume_reviews table.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create table:', error);
    process.exit(1);
  }
}

setup();
