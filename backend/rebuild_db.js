const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('Dropping existing database if it exists...');
    await connection.query('DROP DATABASE IF EXISTS campusai;');
    
    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying full schema...');
    await connection.query(sql);
    console.log('Schema applied successfully. All tables have been recreated from scratch!');
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    await connection.end();
  }
}

run();
