import env from "dotenv";
import appConfig from "./app.config.js";

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

let user = process.env.PG_USER;
let host = process.env.PG_HOST;
let database = process.env.PG_DATABASE;
let password = process.env.PG_PASSWORD;
let port = process.env.PG_PORT;
let schema = process.env.PG_SCHEMA || 'public';


if (appConfig.environment === 'local') {
  user = process.env.PGL_USER;
  host = process.env.PGL_HOST;
  database = process.env.PGL_DATABASE;
  password = process.env.PGL_PASSWORD;
  port = process.env.PGL_PORT;
  schema = process.env.PGL_SCHEMA;
  console.log(`Application environment: ${appConfig.environment}`);
} else if (appConfig.environment === 'development') {
  user = process.env.PGD_USER;
  host = process.env.PGD_HOST;
  database = process.env.PGD_DATABASE;
  password = process.env.PGD_PASSWORD;
  port = process.env.PGD_PORT;
  schema = process.env.PGD_SCHEMA;
  console.log(`Application environment is ${appConfig.environment} and schema set to ${schema}`);
}

const pgConfig = {
    user,
    host,
    database,
    password,
    port,
    schema,
}

const redisConfig = {
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    cachingEnv: process.env.CACHING_ENVIRONMENT || "production",
}

export default {
    pgConfig,
    redisConfig
}

// With key names same as variable names, we can use shorthand syntax
// export default {
//     user: user,
//     host: host,
//     database: database,
//     password: password,
//     port: port,
//     schema: schema,
//     environment: environment
// }
