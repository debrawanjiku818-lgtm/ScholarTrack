-- ScholarTrack Database Schema for RBAC
-- This script initializes the database with users, roles, and permissions

-- Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('student', 'admin', 'staff');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table (student-course relationships)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create assignments table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    max_points INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER,
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    feedback TEXT
);

-- Create sessions table for authentication
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);

-- Insert default users (password: admin123/staff123/student123 - demo bypass in login API)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin@scholartrack.com', 'System Administrator', 'admin'),
('staff', '$2b$10$YourHashedPasswordHere', 'staff@scholartrack.com', 'Staff Member', 'staff'),
('student', '$2b$10$YourHashedPasswordHere', 'student@scholartrack.com', 'Demo Student', 'student');

-- Insert sample courses
INSERT INTO courses (name, description, image_url) VALUES
('Mathematics', 'Algebra, geometry, calculus.', '/maths.jpg'),
('Computer Science', 'Programming, databases, web dev.', '/cs.jpg'),
('Biology', 'Life sciences and experiments.', '/biology.jpg'),
('History', 'World history and culture.', '/history.jpg'),
('Physics', 'Mechanics, thermodynamics, waves.', '/physics.jpg'),
('Chemistry', 'Organic, inorganic, physical chemistry.', '/chemistry.jpg'),
('Geography', 'Physical and human geography.', '/geography.jpg'),
('Literature', 'Poetry, novels, drama analysis.', '/literature.jpg');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
