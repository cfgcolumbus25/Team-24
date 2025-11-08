CREATE TABLE school_policies (
                                 id SERIAL PRIMARY KEY,
                                 school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
                                 exam_id INTEGER NOT NULL REFERENCES clep_exams(id) ON DELETE CASCADE,
                                 min_score INTEGER NOT NULL,
                                 course_code VARCHAR(50),
                                 course_name VARCHAR(255),
                                 credits DECIMAL(4, 2),
                                 is_general_credit BOOLEAN DEFAULT FALSE,
                                 notes TEXT,
                                 is_updated BOOLEAN DEFAULT TRUE,
                                 updated_at DATE,
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 UNIQUE(school_id, exam_id)
);
