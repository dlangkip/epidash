-- EpiDash - Epidemiological Data Dashboard Database Schema
-- Created for CEMA Software Engineering Internship Application

-- Create database
CREATE DATABASE IF NOT EXISTS epidash;
USE epidash;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    region_code VARCHAR(10) PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    population INT UNSIGNED NULL,
    area_sqkm DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diseases table
CREATE TABLE IF NOT EXISTS diseases (
    disease_id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NULL COMMENT 'e.g., Viral, Bacterial, Parasitic',
    is_seasonal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Age groups reference table
CREATE TABLE IF NOT EXISTS age_groups (
    age_group_id INT AUTO_INCREMENT PRIMARY KEY,
    age_range VARCHAR(20) NOT NULL COMMENT 'e.g., 0-14, 15-24',
    description VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Season peaks table for seasonal disease patterns
CREATE TABLE IF NOT EXISTS season_peaks (
    peak_id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT NOT NULL,
    month_start INT NOT NULL COMMENT 'Month number (1-12)',
    month_end INT NOT NULL COMMENT 'Month number (1-12)',
    intensity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main epidemiological data table
CREATE TABLE IF NOT EXISTS epidemiological_data (
    data_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_recorded DATE NOT NULL,
    region_code VARCHAR(10) NOT NULL,
    disease_id INT NOT NULL,
    age_group_id INT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    cases INT UNSIGNED NOT NULL DEFAULT 0,
    recoveries INT UNSIGNED NOT NULL DEFAULT 0,
    deaths INT UNSIGNED NOT NULL DEFAULT 0,
    active INT UNSIGNED NOT NULL DEFAULT 0,
    notes TEXT NULL,
    reported_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_code) REFERENCES regions(region_code) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE,
    FOREIGN KEY (age_group_id) REFERENCES age_groups(age_group_id) ON DELETE CASCADE,
    INDEX idx_date (date_recorded),
    INDEX idx_region (region_code),
    INDEX idx_disease (disease_id),
    INDEX idx_combo (date_recorded, region_code, disease_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table for dashboard access
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NULL,
    role ENUM('admin', 'data_entry', 'viewer') NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved filters/views table
CREATE TABLE IF NOT EXISTS saved_views (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    view_name VARCHAR(100) NOT NULL,
    filter_json JSON NOT NULL COMMENT 'Saved filter settings in JSON format',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT 'e.g., INSERT, UPDATE, DELETE, LOGIN',
    table_name VARCHAR(50) NULL,
    record_id VARCHAR(100) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for regions (Kenya counties)
INSERT INTO regions (region_code, region_name, latitude, longitude, population) VALUES
('NAI', 'Nairobi', -1.2921, 36.8219, 4397073),
('MOM', 'Mombasa', -4.0435, 39.6682, 1208333),
('KWL', 'Kwale', -4.1821, 39.4662, 866820),
('KLF', 'Kilifi', -3.6305, 39.8499, 1453787),
('TAN', 'Tana River', -1.4876, 39.6359, 315943),
('LAM', 'Lamu', -2.2719, 40.9019, 143920),
('TTV', 'Taita Taveta', -3.3945, 38.4510, 340671),
('GAR', 'Garissa', -0.4530, 39.6468, 841353),
('WJR', 'Wajir', 1.7471, 40.0573, 781263),
('MAN', 'Mandera', 3.9366, 41.8675, 867457),
('MRS', 'Marsabit', 2.3352, 37.9982, 459785),
('ISL', 'Isiolo', 0.3550, 37.5822, 268002),
('MER', 'Meru', 0.0466, 37.6569, 1545714),
('TNT', 'Tharaka-Nithi', -0.3072, 37.6430, 393177);

-- Insert sample diseases
INSERT INTO diseases (disease_name, category, is_seasonal) VALUES
('Malaria', 'Parasitic', TRUE),
('Tuberculosis', 'Bacterial', FALSE),
('Cholera', 'Bacterial', TRUE),
('Dengue Fever', 'Viral', TRUE),
('Typhoid', 'Bacterial', FALSE),
('HIV/AIDS', 'Viral', FALSE);

-- Insert age groups
INSERT INTO age_groups (age_range, description) VALUES
('0-14', 'Children'),
('15-24', 'Youth'),
('25-44', 'Young Adults'),
('45-64', 'Middle-aged Adults'),
('65+', 'Elderly');

-- Insert season peaks for seasonal diseases
INSERT INTO season_peaks (disease_id, month_start, month_end, intensity) VALUES
(1, 4, 6, 'high'), -- Malaria (Apr-Jun)
(1, 10, 11, 'high'), -- Malaria (Oct-Nov)
(3, 3, 5, 'medium'), -- Cholera (Mar-May)
(3, 10, 12, 'high'), -- Cholera (Oct-Dec)
(4, 4, 6, 'high'), -- Dengue (Apr-Jun)
(4, 10, 11, 'medium'); -- Dengue (Oct-Nov)

-- Create an admin user (default password is 'admin123' - you would hash this in production)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('admin', '$2y$10$xJQbpJOWASAtLlpxVYCciu.MNfIzj09vULeWR1QUzLFAn3HXY2S8O', 'admin@example.com', 'Administrator', 'admin');

-- Create a sample view
INSERT INTO saved_views (user_id, view_name, filter_json, is_public) VALUES
(1, 'Malaria Overview', '{"disease": 1, "startDate": "2023-01-01", "endDate": "2023-12-31", "groupBy": "monthly"}', TRUE);