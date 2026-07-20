-- Create Database
CREATE DATABASE IF NOT EXISTS campusai;
USE campusai;

-- Suppress "Table already exists" warnings (Note-level warnings)
SET sql_notes = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'club_admin', 'admin') DEFAULT 'student',
  account_status ENUM('active', 'pending', 'suspended') DEFAULT 'active',
  avatar_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  prn_number VARCHAR(100) DEFAULT NULL,
  major VARCHAR(150),
  graduation_year INT,
  bio TEXT,
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(150),
  title VARCHAR(150),
  office_location VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Admins
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  access_level VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  admin_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Club Members
CREATE TABLE IF NOT EXISTS club_members (
  club_id INT NOT NULL,
  student_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  sys_admin_approved BOOLEAN DEFAULT TRUE,
  club_admin_approved BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (club_id, student_id),
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 6.5 Club Hackathons
CREATE TABLE IF NOT EXISTS club_hackathons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  max_team_size INT DEFAULT 4,
  prize_pool VARCHAR(100),
  registration_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- 7. Events
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  INDEX idx_events_date (event_date)
);

-- 8. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, student_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 9. Notes (Smart Learning Hub)
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploader_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(150),
  file_url VARCHAR(500) NOT NULL,
  file_type ENUM('PDF', 'DOCX', 'PPT', 'IMAGE', 'OTHER') DEFAULT 'OTHER',
  file_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notes_subject (subject)
);

-- 10. Internships (Opportunity Hub)
CREATE TABLE IF NOT EXISTS internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(150) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  stipend VARCHAR(100),
  location VARCHAR(150),
  type ENUM('Internship', 'Hackathon', 'Scholarship') DEFAULT 'Internship',
  posted_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_internships_type (type)
);

-- 11. Internship Applications
CREATE TABLE IF NOT EXISTS internship_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  internship_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('Pending', 'Reviewed', 'Accepted', 'Rejected') DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 12. Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  ats_score INT DEFAULT 0,
  feedback TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. AI Chats (Copilot)
CREATE TABLE IF NOT EXISTS ai_chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  course VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  grade VARCHAR(50),
  feedback TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- 17. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  student_id INT NOT NULL,
  course VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);
