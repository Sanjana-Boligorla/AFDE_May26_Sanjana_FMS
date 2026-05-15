-- ============================================================
-- Feedback Management System — Database Schema
-- Database: FMS_db | Engine: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS FMS_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE FMS_db;

-- ─── Feedback Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id    INT             NOT NULL AUTO_INCREMENT,
    participant_name VARCHAR(255)  NOT NULL,
    program_name   VARCHAR(255)   NOT NULL,
    rating         TINYINT        NOT NULL,
    comments       TEXT,
    submitted_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (feedback_id),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),

    -- Indexes for search & filter performance
    INDEX idx_rating       (rating),
    INDEX idx_program_name (program_name),
    INDEX idx_submitted_at (submitted_at)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─── Seed Data (optional, for testing) ───────────────────────
INSERT INTO feedback (participant_name, program_name, rating, comments) VALUES
  ('Alice Johnson',  'Python for Data Engineering', 5, 'Excellent course! Very well structured and hands-on.'),
  ('Bob Smith',      'FastAPI Masterclass',         4, 'Great content. Would appreciate more real-world examples.'),
  ('Carol Williams', 'React Fundamentals',           3, 'Good introduction but moved a bit fast for beginners.'),
  ('David Lee',      'MySQL & SQLAlchemy',           5, 'Absolutely loved it. The instructor was very clear.'),
  ('Emma Davis',     'Python for Data Engineering', 2, 'Topics were relevant but the material felt outdated.');
