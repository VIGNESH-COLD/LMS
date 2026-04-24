USE lms_db;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM timetables;
DELETE FROM sections;
DELETE FROM academic_classes;
DELETE FROM departments;

DELETE FROM users 
WHERE role IN ('STUDENT', 'INSTRUCTOR') 
  AND email NOT IN ('t1@gmail.com', 'student@lms.edu');

SET FOREIGN_KEY_CHECKS = 1;
