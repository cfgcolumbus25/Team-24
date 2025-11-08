import * as dotenv from 'dotenv';
import { Pool, QueryResult } from 'pg';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err: Error | null, res: QueryResult) => {
    if (err) {
        console.log(err, "failed");
    } else {
        console.log("success");
    }
});

export default pool;