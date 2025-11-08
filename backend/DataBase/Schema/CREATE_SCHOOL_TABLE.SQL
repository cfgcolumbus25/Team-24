CREATE TABLE schools (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL,
                         address VARCHAR(255),
                         city VARCHAR(100),
                         state VARCHAR(2),
                         zip VARCHAR(10),
                         latitude DECIMAL(10, 8),
                         longitude DECIMAL(11, 8),
                         website_url VARCHAR(255),
                         registrar_email VARCHAR(255),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);