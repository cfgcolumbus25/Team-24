import dotenv from 'dotenv'
const {Pool, QueryResult} = require('pg')

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    SSL: {rejectUnauthorized: false},
})

pool.query('SELECT NOW()', (err: Error | null, res: QueryResult)  =>   {

    if(err){
        console.log(err, "failed")

    }else{
        console.log("success")
    }
})