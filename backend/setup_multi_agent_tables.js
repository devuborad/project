require('dotenv').config();
const db = require('./config/db');

async function setupMultiAgentTables() {
  try {
    console.log('Connecting to MySQL to create Multi-Agent AI tables...');

    // 1. agent_logs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        agent_name VARCHAR(100) NOT NULL,
        intent_detected VARCHAR(100) NULL,
        prompt TEXT NOT NULL,
        response TEXT NULL,
        confidence FLOAT DEFAULT 1.0,
        status VARCHAR(50) DEFAULT 'success',
        execution_time_ms INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created agent_logs table');

    // 2. study_plans
    await db.execute(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        plan_type VARCHAR(100) DEFAULT 'general',
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created study_plans table');

    console.log('🚀 All Multi-Agent AI Platform tables set up successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Multi-Agent AI tables:', error);
    process.exit(1);
  }
}

setupMultiAgentTables();
