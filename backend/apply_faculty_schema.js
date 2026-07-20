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
  CREATE TABLE IF NOT EXISTS lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    course VARCHAR(150) NOT NULL,
    topic VARCHAR(255),
    meeting_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS course_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    student_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (faculty_id, course_name, student_id)
  );
  `;

  console.log('Applying faculty schema...');
  await connection.query(sql);
  console.log('Faculty schema applied successfully.');
  
  await connection.end();
}

run().catch(console.error);
