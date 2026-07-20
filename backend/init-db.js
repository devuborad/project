const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL to initialize database...');
    // Connect without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Needed to run the entire schema file at once
    });

    console.log('Creating database campusai if it does not exist...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS campusai;`);
    await connection.query(`USE campusai;`);

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(schema);

    console.log('Database initialized successfully! You can now start the server.');
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDatabase();
