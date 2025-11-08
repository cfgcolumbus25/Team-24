//main server code
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cors from 'cors';
import pool from './DataBase/Connection/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

//enable cors for frontend requests
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parse json request bodies
app.use(express.json());

//types
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

//helper function to generate session token
const generateSessionToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

//helper function to validate registration input
const validateRegistration = (username: string, email: string, password: string): string | null => {
    //check username length
    if (!username || username.length < 3) {
        return 'Username must be at least 3 characters long';
    }

    //validate .edu email with regex
    const eduEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/;
    if (!email || !eduEmailRegex.test(email)) {
        return 'Please provide a valid .edu email address';
    }

    //check password length
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
};

//register endpoint
app.post('/api/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
        //get registration data from request
        const { username, email, password } = req.body;

        //validate input
        const validationError = validateRegistration(username, email, password);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        //check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        //return error if user exists
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        //hash password with bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        //insert new user into database
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );

        //create session token
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

        //save session to database
        await pool.query(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
            [newUser.rows[0].id, sessionToken, expiresAt]
        );

        //return success response with session token
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

//login endpoint
app.post('/api/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
        //get login credentials from request
        const { username, password } = req.body;

        //validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        //find user in database
        const userQuery = await pool.query(
            'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
            [username]
        );

        //return error if user not found
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userQuery.rows[0];

        //verify password hash
        const passwordValid = await bcrypt.compare(password, user.password_hash);

        //return error if password invalid
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //create session token
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

        //save session to database
        await pool.query(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
            [user.id, sessionToken, expiresAt]
        );

        //return success response with session token
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

//logout endpoint
app.post('/api/logout', async (req: Request, res: Response) => {
    try {
        //get session token from authorization header
        const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

        //validate token exists
        if (!sessionToken) {
            return res.status(400).json({ error: 'No session token provided' });
        }

        //delete session from database
        await pool.query(
            'DELETE FROM sessions WHERE session_token = $1',
            [sessionToken]
        );

        //return success response
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
});

//authentication middleware
const authenticateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    //get session token from authorization header
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

    //return error if no token
    if (!sessionToken) {
        res.status(401).json({ error: 'Session token required' });
        return;
    }

    try {
        //find session in database
        const sessionQuery = await pool.query(
            `SELECT s.user_id, s.expires_at, u.username 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.session_token = $1`,
            [sessionToken]
        );

        //return error if session not found
        if (sessionQuery.rows.length === 0) {
            res.status(401).json({ error: 'Invalid session' });
            return;
        }

        const session = sessionQuery.rows[0];

        //check if session expired
        if (new Date(session.expires_at) < new Date()) {
            //delete expired session
            await pool.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
            res.status(401).json({ error: 'Session expired' });
            return;
        }

        //attach user info to request
        req.userId = session.user_id;
        req.username = session.username;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};

//protected route - get user profile
app.get('/api/profile', authenticateSession, async (req: AuthRequest, res: Response) => {
    try {
        //validate user is authenticated
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        //get user details from database
        const userQuery = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        //handle user not found
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        //return user profile
        res.json({
            user: userQuery.rows[0]
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

//cleanup expired sessions endpoint
app.post('/api/cleanup-sessions', async (req: Request, res: Response) => {
    try {
        //delete all expired sessions
        const result = await pool.query(
            'DELETE FROM sessions WHERE expires_at < NOW()'
        );

        //return count of deleted sessions
        res.json({ message: `Cleaned up ${result.rowCount} expired sessions` });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Server error during cleanup' });
    }
});

//get all schools with optional filters
app.get('/api/schools', async (req: Request, res: Response) => {
    try {
        //get query parameters
        const { state, city, examId } = req.query;

        //build sql query with schools, policies, and votes
        let query = `
            SELECT 
                s.*,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', sp.id,
                            'examId', sp.exam_id,
                            'minScore', sp.min_score,
                            'courseCode', sp.course_code,
                            'courseName', sp.course_name,
                            'credits', sp.credits,
                            'isGeneralCredit', sp.is_general_credit,
                            'notes', sp.notes,
                            'isUpdated', sp.is_updated,
                            'updatedAt', sp.updated_at
                        )
                    ) FILTER (WHERE sp.id IS NOT NULL),
                    '[]'
                ) as policies,
                (
                    SELECT json_build_object(
                        'upvotes', COUNT(*) FILTER (WHERE vote_type = 'upvote'),
                        'downvotes', COUNT(*) FILTER (WHERE vote_type = 'downvote')
                    )
                    FROM votes v
                    WHERE v.school_id = s.id
                ) as votes
            FROM schools s
            LEFT JOIN school_policies sp ON s.id = sp.school_id
        `;

        const params: any[] = [];
        const conditions: string[] = [];

        //add state filter if provided
        if (state) {
            params.push(state);
            conditions.push(`s.state = $${params.length}`);
        }

        //add city filter if provided
        if (city) {
            params.push(city);
            conditions.push(`s.city ILIKE $${params.length}`);
        }

        //add exam filter if provided
        if (examId) {
            params.push(examId);
            conditions.push(`sp.exam_id = $${params.length}`);
        }

        //append where clause if filters exist
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        //group by school and order alphabetically
        query += ` GROUP BY s.id ORDER BY s.name`;

        //execute query
        const result = await pool.query(query, params);

        //return schools with count
        res.json({
            schools: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ error: 'Server error fetching schools' });
    }
});

//search schools by name, city, or state
app.get('/api/schools/search', async (req: Request, res: Response) => {
    try {
        //get search query parameter
        const { q } = req.query;

        //validate query exists
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }

        //search schools matching query
        const result = await pool.query(
            `SELECT
                 s.*,
                 COALESCE(
                         json_agg(
                             DISTINCT jsonb_build_object(
                            'id', sp.id,
                            'examId', sp.exam_id,
                            'minScore', sp.min_score,
                            'courseCode', sp.course_code,
                            'courseName', sp.course_name,
                            'credits', sp.credits,
                            'isGeneralCredit', sp.is_general_credit,
                            'notes', sp.notes,
                            'isUpdated', sp.is_updated,
                            'updatedAt', sp.updated_at
                        )
                    ) FILTER (WHERE sp.id IS NOT NULL),
                         '[]'
                 ) as policies,
                 (
                     SELECT json_build_object(
                                    'upvotes', COUNT(*) FILTER (WHERE vote_type = 'upvote'),
                                    'downvotes', COUNT(*) FILTER (WHERE vote_type = 'downvote')
                            )
                     FROM votes v
                     WHERE v.school_id = s.id
                 ) as votes
             FROM schools s
                      LEFT JOIN school_policies sp ON s.id = sp.school_id
             WHERE s.name ILIKE $1 OR s.city ILIKE $1 OR s.state ILIKE $1
             GROUP BY s.id
             ORDER BY s.name
                 LIMIT 20`,
            [`%${q}%`]
        );

        //return matching schools
        res.json({
            schools: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error searching schools:', error);
        res.status(500).json({ error: 'Server error searching schools' });
    }
});

//get single school by id
app.get('/api/schools/:id', async (req: Request, res: Response) => {
    try {
        //get school id from url parameter
        const { id } = req.params;

        //query school with policies and votes
        const result = await pool.query(
            `SELECT 
                s.*,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', sp.id,
                            'examId', sp.exam_id,
                            'minScore', sp.min_score,
                            'courseCode', sp.course_code,
                            'courseName', sp.course_name,
                            'credits', sp.credits,
                            'isGeneralCredit', sp.is_general_credit,
                            'notes', sp.notes,
                            'isUpdated', sp.is_updated,
                            'updatedAt', sp.updated_at
                        )
                    ) FILTER (WHERE sp.id IS NOT NULL),
                    '[]'
                ) as policies,
                (
                    SELECT json_build_object(
                        'upvotes', COUNT(*) FILTER (WHERE vote_type = 'upvote'),
                        'downvotes', COUNT(*) FILTER (WHERE vote_type = 'downvote')
                    )
                    FROM votes v
                    WHERE v.school_id = s.id
                ) as votes
            FROM schools s
            LEFT JOIN school_policies sp ON s.id = sp.school_id
            WHERE s.id = $1
            GROUP BY s.id`,
            [id]
        );

        //handle school not found
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }

        //return school data
        res.json({
            school: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching school:', error);
        res.status(500).json({ error: 'Server error fetching school' });
    }
});

//get all clep exams
app.get('/api/clep-exams', async (req: Request, res: Response) => {
    try {
        //query all clep exams ordered by category and name
        const result = await pool.query(
            'SELECT * FROM clep_exams ORDER BY category, name'
        );

        //return exam list
        res.json({
            exams: result.rows
        });
    } catch (error) {
        console.error('Error fetching CLEP exams:', error);
        res.status(500).json({ error: 'Server error fetching CLEP exams' });
    }
});

//start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;