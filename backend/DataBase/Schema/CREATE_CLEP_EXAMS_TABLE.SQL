CREATE TABLE clep_exams (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            category VARCHAR(100),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);