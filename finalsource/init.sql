
-- ---------------------- THIS IS JUST AN EXAMPLE ------------------------
-- - PLEASE DELETE THIS AND REPLACE IT WITH YOUR ACTUAL PROJECT SCHEMA ---


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    body TEXT COMMENT 'Content of the post',
    user_id INT,
    status ENUM('draft', 'published', 'private') COMMENT 'private: visible via URL only',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);