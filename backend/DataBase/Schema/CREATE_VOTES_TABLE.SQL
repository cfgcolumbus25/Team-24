CREATE TABLE votes (
                       id SERIAL PRIMARY KEY,
                       school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
                       vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
                       user_ip VARCHAR(45),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_votes_school_id ON votes(school_id);
