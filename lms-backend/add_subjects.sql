USE lms_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Faculty
INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mr.J. Praveen Kumar', 'praveen@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u1 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Ms.S.Bharathy', 'bharathy@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u2 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mr.M.Babu', 'babu@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u3 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mr.M.L.Srinivasan', 'srinivasan@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u4 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Ms.J.Sindhuja', 'sindhuja@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u5 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mr.M.O.Ramkumar', 'ramkumar@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u6 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Ms.P.Somasundari', 'somasundari@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u7 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mr.P.Murugan', 'murugan@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u8 = LAST_INSERT_ID();

INSERT INTO users (name, email, password, role, department, created_at) VALUES ('Mrs.G.Kavitha', 'kavitha@lms.edu', '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 'INSTRUCTOR', 'Computer Science', NOW());
SET @u9 = LAST_INSERT_ID();

-- Courses
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23411 - Database Management Systems', 'Core Subject', @u1, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23412 - Operating Systems', 'Core Subject', @u2, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23413 - Theory of Computation', 'Core Subject', @u3, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23414 - Software Development Practices', 'Core Subject', @u4, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('AL23432 - Machine Learning Techniques', 'Core Subject', @u5, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23431 - Design and analysis of algorithm', 'Core Subject', @u7, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23421 - Database Management Systems Laboratory', 'Lab', @u1, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS23422 - Operating Systems Laboratory', 'Lab', @u2, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('CS231G2 - Visualization Tools', 'Lab', @u5, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('Mentoring', 'Mentorship Program', @u6, NOW());
INSERT INTO courses (title, description, instructor_id, created_at) VALUES ('Placement and Training', 'Training', @u1, NOW());

SET FOREIGN_KEY_CHECKS = 1;
