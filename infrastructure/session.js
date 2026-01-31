import expressSession from "express-session";
import { appConfig } from "../config/configuration.js";

const session = expressSession({
  secret: appConfig.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
});

export default session;
