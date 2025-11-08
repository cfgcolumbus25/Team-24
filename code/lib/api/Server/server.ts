//main server code

//since using express as server
import express, {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import pool from './db';
import dotenv from 'dotenv';

dotenv.config()

const app = express()


// Allows requests from your frontend (localhost:3000) to backend (localhost:5001)
// Without this, browser blocks requests due to security policy
app.use(cors())
/*middleware is different programs that express uses to change how things work*/

// JSON Parser Middleware
// Parses incoming JSON in request body
// Example: { "name": "Margherita", "rating": 5 }
// Without this, req.body would be undefined
app.use(express.json())

//types
interface RegisterBody{
    username: string,
    email: string,
    password: string
}

interface LoginBody{
    username: string,
    password: string
}

interface JwtPayload{
    userId: number,
    username: string
}

interface AuthRequest extends Request{
    user?: JwtPayload
}

//Register endpoint
app.post('/api/register', async (req: Request<{},{}, RegisterBody>, res: Response) => {
    try{
        const {username, email, password} = req.body

        //validation

        //check if user exist

        //hash password with bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds)

        //Insert new user into db
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1,$2, $3) RETURNING id, username email, created_at',
            [username, email, passwordHash]
        )

        //generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.rows[0].id,
                username: newUser.rows[0].username
            },
            process.env.JWT_SECRET as string,
            {expressIn: '24h'}
        )

        //note success
        res.status(201).loadgeojson({

        })
    }
});

