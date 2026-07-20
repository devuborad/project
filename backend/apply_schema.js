const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

const sql = `
  ALTER TABLE club_members 
  ADD COLUMN sys_admin_approved BOOLEAN DEFAULT TRUE,
  ADD COLUMN club_admin_approved BOOLEAN DEFAULT TRUE;
  `;

  console.log('Applying schema...');
  await connection.query(sql);
  console.log('Schema applied successfully.');
  
  await connection.end();
}

run().catch(console.error);
