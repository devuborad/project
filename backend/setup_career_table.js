require('dotenv').config();
const db = require('./config/db');

async function setup() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS career_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        sender ENUM('user', 'ai') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await db.execute(query);
    console.log('✅ Successfully created career_chats table.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create table:', error);
    process.exit(1);
  }
}

setup();
