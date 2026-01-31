import pg from "pg";
// import Redis from "ioredis";
import { Redis } from "@upstash/redis";
import { pgConfig, redisConfig } from "../config/configuration.js";

const db = new pg.Pool({
  user: pgConfig.user,
  host: pgConfig.host,
  database: pgConfig.database,
  password: pgConfig.password,
  port: pgConfig.port,
});

// ✅ `pg.Pool` handles connection pooling automatically,
// so calling `connect()` is usually unnecessary.
// Use this only if you need to pre-warm the connection pool.
// dbPool.connect();

let redis = null;

if (redisConfig.cachingEnv == "local") {
  redis = new Redis({
    host: process.env.REDIS_HOST, // Use service name from docker-compose
    port: process.env.REDIS_PORT,
  }); // Connects to Redis at localhost:6379
} else {
  // // If your Redis is hosted elsewhere, specify the connection string
  // const redis = new Redis("redis://your-redis-url:6379");
  redis = new Redis({
    url: redisConfig.url,
    token: redisConfig.token,
  });
}

const schema = pgConfig.schema;
console.log("schema:", schema);

export default {
  query: (text, params) => db.query(text, params), // Abstraction
};

export { redis, schema };
