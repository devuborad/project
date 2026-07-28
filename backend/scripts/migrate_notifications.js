const db = require('../config/db');

async function migrate() {
  try {
    await db.execute(`
      ALTER TABLE notifications 
      ADD COLUMN type VARCHAR(100) NULL DEFAULT 'general',
      ADD COLUMN title VARCHAR(255) NULL DEFAULT 'Notification',
      ADD COLUMN data_json JSON NULL
    `);
    console.log('✅ Added type, title, and data_json columns to notifications table.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column')) {
      console.log('✔ Columns already exist.');
    } else {
      console.error('Error:', err.message);
    }
  }
  process.exit(0);
}

migrate();
