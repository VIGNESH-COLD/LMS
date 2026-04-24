USE lms_db;
SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO departments (name) VALUES ('Computer Science');
SELECT id INTO @deptId FROM departments WHERE name = 'Computer Science' LIMIT 1;

INSERT INTO academic_classes (batch_year, college_year, semester, department_id) VALUES (2024, 2, 4, @deptId);
SET @classId = LAST_INSERT_ID();

INSERT INTO sections (name, class_id) VALUES ('G', @classId);
SET @sectionId = LAST_INSERT_ID();

-- Insert 60 students
DROP PROCEDURE IF EXISTS InsertStudents;
DELIMITER //
CREATE PROCEDURE InsertStudents()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 60 DO
    INSERT INTO users (name, email, password, role, department, section, roll_number, year, semester, created_at) 
    VALUES (
      CONCAT('Student ', i, ' CSE-G'), 
      CONCAT('student', i, '@lms.edu'), 
      '$2a$10$4E9mK6SMMygFJ7ZwgmzGCerw7adjhl9LJh9m53w55eYwAy8e1NfYe', 
      'STUDENT', 'Computer Science', 'G', 
      CONCAT('RA2211003010', LPAD(i, 3, '0')), 
      2, 4, 
      NOW()
    );
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL InsertStudents();
DROP PROCEDURE InsertStudents;

-- Update the default test student to also be in this section
UPDATE users SET department='Computer Science', section='G', year=2, semester=4, roll_number='RA2211003010200' WHERE email='student@lms.edu';

-- Insert Timetable
-- Map:
-- 3: CS23411 DBMS
-- 4: CS23412 OS
-- 5: CS23413 TOC
-- 6: CS23414 SDP
-- 7: AL23432 MLT
-- 8: CS23431 DAA
-- 9: CS23421 DBMS Lab
-- 10: CS23422 OS Lab
-- 11: CS231G2 Vis Tools
-- 12: Mentoring
-- 13: Placement & Training

-- Monday
INSERT INTO timetables (course_id, section_id, day_of_week, start_time, end_time, room, building) VALUES 
(9, @sectionId, 'MONDAY', '08:00', '08:50', 'A208', 'Main Block'),
(9, @sectionId, 'MONDAY', '08:50', '09:40', 'A208', 'Main Block'),
(6, @sectionId, 'MONDAY', '10:10', '11:00', 'A208', 'Main Block'),
(4, @sectionId, 'MONDAY', '11:00', '11:50', 'A208', 'Main Block'),
(5, @sectionId, 'MONDAY', '11:50', '12:40', 'A208', 'Main Block'),
(8, @sectionId, 'MONDAY', '13:30', '14:15', 'A208', 'Main Block'),
(13, @sectionId, 'MONDAY', '14:15', '15:00', 'A208', 'Main Block');

-- Tuesday
INSERT INTO timetables (course_id, section_id, day_of_week, start_time, end_time, room, building) VALUES 
(6, @sectionId, 'TUESDAY', '08:00', '08:50', 'A208', 'Main Block'),
(3, @sectionId, 'TUESDAY', '08:50', '09:40', 'A208', 'Main Block'),
(7, @sectionId, 'TUESDAY', '10:10', '11:00', 'A208', 'Main Block'),
(3, @sectionId, 'TUESDAY', '11:00', '11:50', 'A208', 'Main Block'),
(5, @sectionId, 'TUESDAY', '11:50', '12:40', 'A208', 'Main Block'),
(7, @sectionId, 'TUESDAY', '13:30', '14:15', 'MLT LAB', 'Main Block'),
(7, @sectionId, 'TUESDAY', '14:15', '15:00', 'MLT LAB', 'Main Block');

-- Wednesday
INSERT INTO timetables (course_id, section_id, day_of_week, start_time, end_time, room, building) VALUES 
(4, @sectionId, 'WEDNESDAY', '08:00', '08:50', 'A208', 'Main Block'),
(5, @sectionId, 'WEDNESDAY', '08:50', '09:40', 'A208', 'Main Block'),
(3, @sectionId, 'WEDNESDAY', '10:10', '11:00', 'A208', 'Main Block'),
(4, @sectionId, 'WEDNESDAY', '11:00', '11:50', 'A208', 'Main Block'),
(6, @sectionId, 'WEDNESDAY', '11:50', '12:40', 'A208', 'Main Block'),
(8, @sectionId, 'WEDNESDAY', '13:30', '14:15', 'A208', 'Main Block'),
(7, @sectionId, 'WEDNESDAY', '14:15', '15:00', 'A208', 'Main Block');

-- Thursday
INSERT INTO timetables (course_id, section_id, day_of_week, start_time, end_time, room, building) VALUES 
(8, @sectionId, 'THURSDAY', '08:00', '08:50', 'DAA LAB', 'Main Block'),
(8, @sectionId, 'THURSDAY', '08:50', '09:40', 'DAA LAB', 'Main Block'),
(7, @sectionId, 'THURSDAY', '10:10', '11:00', 'A208', 'Main Block'),
(5, @sectionId, 'THURSDAY', '11:00', '11:50', 'A208', 'Main Block'),
(8, @sectionId, 'THURSDAY', '11:50', '12:40', 'A208', 'Main Block'),
(12, @sectionId, 'THURSDAY', '13:30', '14:15', 'A208', 'Main Block'),
(3, @sectionId, 'THURSDAY', '14:15', '15:00', 'A208', 'Main Block');

-- Friday
INSERT INTO timetables (course_id, section_id, day_of_week, start_time, end_time, room, building) VALUES 
(5, @sectionId, 'FRIDAY', '08:00', '08:50', 'A208', 'Main Block'),
(6, @sectionId, 'FRIDAY', '08:50', '09:40', 'A208', 'Main Block'),
(8, @sectionId, 'FRIDAY', '10:10', '11:00', 'A208', 'Main Block'),
(10, @sectionId, 'FRIDAY', '11:00', '11:50', 'OS LAB', 'Main Block'),
(10, @sectionId, 'FRIDAY', '11:50', '12:40', 'OS LAB', 'Main Block'),
(4, @sectionId, 'FRIDAY', '13:30', '14:15', 'A208', 'Main Block'),
(7, @sectionId, 'FRIDAY', '14:15', '15:00', 'A208', 'Main Block');

SET FOREIGN_KEY_CHECKS = 1;
