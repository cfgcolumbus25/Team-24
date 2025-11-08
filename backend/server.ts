// main server code
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cors from 'cors';
import pool from './DataBase/Connection/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Types
interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface LoginBody {
    username: string;
    password: string;
}

interface AuthRequest extends Request {
    userId?: number;
    username?: string;
}

// Helper function to generate session token
const generateSessionToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper function to validate registration input
const validateRegistration = (username: string, email: string, password: string): string | null => {
    if (!username || username.length < 3) {
        return 'Username must be at least 3 characters long';
    }

    // Validate .edu email with regex
    const eduEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/;
    if (!email || !eduEmailRegex.test(email)) {
        return 'Please provide a valid .edu email address';
    }

    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
};

// Register endpoint
app.post('/api/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const validationError = validateRegistration(username, email, password);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );

        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await pool.query(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
            [newUser.rows[0].id, sessionToken, expiresAt]
        );

        res.status(201).json({
            message: 'User registered successfully!',
            sessionToken: sessionToken,
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email,
                created_at: newUser.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login endpoint
app.post('/api/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const userQuery = await pool.query(
            'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
            [username]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userQuery.rows[0];

        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session in database
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await pool.query(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
            [user.id, sessionToken, expiresAt]
        );

        res.status(200).json({
            message: 'Login successful!',
            sessionToken: sessionToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Logout endpoint
app.post('/api/logout', async (req: Request, res: Response) => {
    try {
        const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(400).json({ error: 'No session token provided' });
        }

        // Delete session from database
        await pool.query(
            'DELETE FROM sessions WHERE session_token = $1',
            [sessionToken]
        );

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
});

// Authentication middleware
const authenticateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

    if (!sessionToken) {
        res.status(401).json({ error: 'Session token required' });
        return;
    }

    try {
        const sessionQuery = await pool.query(
            `SELECT s.user_id, s.expires_at, u.username 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.session_token = $1`,
            [sessionToken]
        );

        if (sessionQuery.rows.length === 0) {
            res.status(401).json({ error: 'Invalid session' });
            return;
        }

        const session = sessionQuery.rows[0];

        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            await pool.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
            res.status(401).json({ error: 'Session expired' });
            return;
        }

        req.userId = session.user_id;
        req.username = session.username;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};

// Protected route example
app.get('/api/profile', authenticateSession, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userQuery = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: userQuery.rows[0]
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cleanup expired sessions (run periodically)
app.post('/api/cleanup-sessions', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'DELETE FROM sessions WHERE expires_at < NOW()'
        );
        res.json({ message: `Cleaned up ${result.rowCount} expired sessions` });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Server error during cleanup' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;