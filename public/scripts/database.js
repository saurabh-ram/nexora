import pg from "pg";
import Redis from "ioredis";
import env from "dotenv";

env.config();

const db = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// ✅ `pg.Pool` handles connection pooling automatically, 
// so calling `connect()` is usually unnecessary. 
// Use this only if you need to pre-warm the connection pool.
// dbPool.connect();



const redis = new Redis({
    host: process.env.REDIS_HOST, // Use service name from docker-compose
    port: process.env.REDIS_PORT,
}); // Connects to Redis at localhost:6379

// // If your Redis is hosted elsewhere, specify the connection string
// const redis = new Redis("redis://your-redis-url:6379");


export default {
    query: (text, params) => db.query(text, params), // Abstraction
};

export { redis };
