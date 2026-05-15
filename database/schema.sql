-- ============================================================
-- Feedback Management System — Database Schema
-- Database : FMS_db
-- Engine   : MySQL 8.0+
-- Version  : 1.1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS FMS_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE FMS_db;

-- ─── Feedback Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (

    -- Primary Key
    feedback_id       INT            NOT NULL AUTO_INCREMENT,

    -- Participant Details
    participant_name  VARCHAR(255)   NOT NULL COMMENT 'Full name of the participant',
    email             VARCHAR(255)       NULL COMMENT 'Participant email address',
    department        VARCHAR(255)       NULL COMMENT 'Department or team of the participant',

    -- Program Details
    program_name      VARCHAR(255)   NOT NULL COMMENT 'Name of the training / event / product',
    category          ENUM(
                        'Training',
                        'Product',
                        'Event',
                        'Service',
                        'Other'
                      )              NOT NULL DEFAULT 'Training' COMMENT 'Type of feedback',
    trainer_name      VARCHAR(255)       NULL COMMENT 'Trainer or instructor name (if applicable)',
    session_date      DATE               NULL COMMENT 'Date of the session / event',

    -- Feedback Content
    rating            TINYINT        NOT NULL COMMENT '1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent',
    comments          TEXT               NULL COMMENT 'Detailed feedback comments',
    would_recommend   TINYINT(1)     NOT NULL DEFAULT 1 COMMENT '1 = Yes, 0 = No',

    -- Timestamps
    submitted_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (feedback_id),
    CONSTRAINT chk_rating          CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_would_recommend CHECK (would_recommend IN (0, 1)),

    -- Indexes
    INDEX idx_rating        (rating),
    INDEX idx_category      (category),
    INDEX idx_program_name  (program_name),
    INDEX idx_trainer_name  (trainer_name),
    INDEX idx_submitted_at  (submitted_at),
    INDEX idx_email         (email)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Central feedback repository for all programs, events and products';


-- ─── Seed Data ───────────────────────────────────────────────
INSERT INTO feedback
  (participant_name, email, department, program_name, category, trainer_name, session_date, rating, comments, would_recommend)
VALUES
  ('Alice Johnson',   'alice.j@example.com',   'Engineering',  'Python for Data Engineering',    'Training', 'Dr. Ramesh Kumar',  '2025-07-01', 5, 'Absolutely outstanding course. The hands-on labs were incredibly well designed. Dr. Ramesh explained every concept with great clarity.',                              1),
  ('Bob Smith',       'bob.s@example.com',      'Analytics',    'FastAPI Masterclass',            'Training', 'Prof. Nisha Patel', '2025-07-02', 4, 'Great content overall. The session on dependency injection was particularly useful. Would appreciate more real-world case studies.',                       1),
  ('Carol Williams',  'carol.w@example.com',    'Marketing',    'React Fundamentals',             'Training', 'Mr. Arjun Mehta',  '2025-07-03', 3, 'Good introduction to React. However, the pace was a bit fast for beginners. Some topics needed more time for practice.',                                0),
  ('David Lee',       'david.l@example.com',    'Data Science', 'MySQL & SQLAlchemy Workshop',    'Training', 'Dr. Ramesh Kumar',  '2025-07-04', 5, 'Loved the structured approach to database design. The SQLAlchemy ORM section was a highlight. Will definitely recommend this to colleagues.',           1),
  ('Emma Davis',      'emma.d@example.com',     'HR',           'Python for Data Engineering',    'Training', 'Prof. Nisha Patel', '2025-07-01', 2, 'The content was relevant but the training material felt outdated. Examples did not align well with real-world scenarios. Needs significant improvement.', 0),
  ('Frank Thomas',    'frank.t@example.com',    'Engineering',  'Cloud Fundamentals Summit',      'Event',    NULL,               '2025-07-05', 4, 'Very well organised event. The keynote sessions were inspiring. Networking opportunities were excellent. Looking forward to next year.',                   1),
  ('Grace Wilson',    'grace.w@example.com',    'Product',      'Agile & Scrum Certification',   'Training', 'Ms. Priya Sharma', '2025-07-06', 5, 'Priya is an exceptional trainer. The certification program was thorough and practical. Passed the exam on first attempt!',                               1),
  ('Henry Martin',    'henry.m@example.com',    'Operations',   'Enterprise CRM Platform',       'Product',  NULL,               NULL,         3, 'The product meets basic requirements but the UI is not intuitive. The reporting module needs a complete overhaul. Support response time is slow.',         0),
  ('Isla Brown',      'isla.b@example.com',     'Finance',      'Data Visualisation with Power BI','Training','Mr. Arjun Mehta',  '2025-07-07', 4, 'Practical and well-paced training. The custom visuals section was very useful. A dedicated Q&A session at the end would make it even better.',           1),
  ('James Garcia',    'james.g@example.com',    'Engineering',  'DevOps & CI/CD Workshop',       'Training', 'Dr. Ramesh Kumar',  '2025-07-08', 5, 'Exceptional content. The pipeline setup demonstrations were crystal clear. Best technical training I have attended this year. Highly recommended.',      1),
  ('Karen White',     'karen.w@example.com',    'Customer Success','Annual Product Launch 2025', 'Event',    NULL,               '2025-07-09', 4, 'Great presentations and live product demos. The Q&A session with the product team was very engaging. Venue and logistics were top-notch.',               1),
  ('Leo Harris',      'leo.h@example.com',      'Analytics',    'Advanced SQL Techniques',       'Training', 'Prof. Nisha Patel', '2025-07-10', 5, 'Every single topic was covered in depth. Window functions, CTEs, and query optimisation — all explained brilliantly. This course is a gem.',             1),
  ('Mia Clark',       'mia.c@example.com',      'Design',       'UX Research & Design Thinking', 'Training', 'Ms. Priya Sharma', '2025-07-11', 4, 'Engaging and thought-provoking. The user journey mapping exercise was a standout activity. Would have liked more time on prototyping tools.',            1),
  ('Noah Lewis',      'noah.l@example.com',     'Engineering',  'Kubernetes for Beginners',      'Training', 'Mr. Arjun Mehta',  '2025-07-12', 3, 'The fundamentals were well covered but the advanced topics were rushed. Lab environment had connectivity issues on Day 2 which disrupted the flow.',    0),
  ('Olivia Walker',   'olivia.w@example.com',   'HR',           'Leadership & Communication',    'Training', 'Ms. Priya Sharma', '2025-07-13', 5, 'Transformational training. The role-play exercises and group discussions were incredibly insightful. I have already applied the learnings at work.',      1);
