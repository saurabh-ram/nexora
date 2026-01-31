import appConfig from "./app.config.js";
import authConfig from "./auth.config.js";
import databaseConfig from "./database.config.js";
import mediaHandler from "./mediahandler.js";

const environment = appConfig.environment;
const pgConfig = databaseConfig.pgConfig;
const redisConfig = databaseConfig.redisConfig;

export {
  appConfig,
  authConfig,
  pgConfig,
  redisConfig,
  mediaHandler,
  environment,
};
