import pg from "pg";
// import Redis from "ioredis";
import { Redis } from '@upstash/redis'
import env from "dotenv";

env.config();

if (!process.env.PG_PORT) {
  console.error('PG_PORT is missing!');
}
if (!process.env.REDIS_URL) {
  console.error('REDIS_URL is missing!');
}
if (!process.env.REDIS_TOKEN) {
  console.error('REDIS_TOKEN is missing!');
}

const environment = process.env.ENVIRONMENT || 'production'; 

console.log(`Database environment: ${environment}`);

let user = process.env.PG_USER;
let host = process.env.PG_HOST;
let database = process.env.PG_DATABASE;
let password = process.env.PG_PASSWORD;
let port = process.env.PG_PORT;
let schema = process.env.PG_SCHEMA || 'public';


if (environment === 'local') {
  user = process.env.PGL_USER;
  host = process.env.PGL_HOST;
  database = process.env.PGL_DATABASE;
  password = process.env.PGL_PASSWORD;
  port = process.env.PGL_PORT;
  schema = process.env.PGL_SCHEMA;
  console.log(`Database environment: ${environment}`);
} else if (environment === 'development') {
  user = process.env.PGD_USER;
  host = process.env.PGD_HOST;
  database = process.env.PGD_DATABASE;
  password = process.env.PGD_PASSWORD;
  port = process.env.PGD_PORT;
  schema = process.env.PGD_SCHEMA;
  console.log(`Database environment is ${environment} and schema set to ${schema}`);
}

const db = new pg.Pool({
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
});

// ✅ `pg.Pool` handles connection pooling automatically, 
// so calling `connect()` is usually unnecessary. 
// Use this only if you need to pre-warm the connection pool.
// dbPool.connect();



// const redis = new Redis({
//     host: process.env.REDIS_HOST, // Use service name from docker-compose
//     port: process.env.REDIS_PORT,
// }); // Connects to Redis at localhost:6379

// // If your Redis is hosted elsewhere, specify the connection string
// const redis = new Redis("redis://your-redis-url:6379");
const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

console.log('schema:', schema);

export default {
    query: (text, params) => db.query(text, params), // Abstraction
};

export { redis, schema };
