// main server code

// since using express as server
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pool from './DataBase/Connection/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Allows requests from your frontend (localhost:3000) to backend (localhost:5001)
// Without this, browser blocks requests due to security policy
app.use(cors());

// JSON Parser Middleware
// Parses incoming JSON in request body
// Example: { "name": "Margherita", "rating": 5 }
// Without this, req.body would be undefined
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

interface JwtPayload {
    userId: number;
    username: string;
}

interface AuthRequest extends Request {
    user?: JwtPayload;
}

// Helper function to validate registration input
const validateRegistration = (username: string, email: string, password: string): string | null => {
    if (!username || username.length < 3) {
        return 'Username must be at least 3 characters long';
    }
    if (!email || !email.includes('@')) {
        return 'Please provide a valid email address';
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

        // Validation
        const validationError = validateRegistration(username, email, password);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password with bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user into db (fixed the SQL query - missing comma)
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.rows[0].id,
                username: newUser.rows[0].username
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' } // Fixed typo: was 'expressIn'
        );

        // Send success response (fixed typo: was 'loadgeojson')
        res.status(201).json({
            message: 'User registered successfully!',
            token: token,
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

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user in database
        const userQuery = await pool.query(
            'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
            [username]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userQuery.rows[0];

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        // Send success response
        res.status(200).json({
            message: 'Login successful!',
            token: token,
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

// Authentication middleware with proper TypeScript types
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization']; // Fixed typo: was 'authroization'
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = decoded as JwtPayload;
        next();
    });
};

// Example protected route
app.get('/api/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch user details from database
        const userQuery = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.user.userId]
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

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;