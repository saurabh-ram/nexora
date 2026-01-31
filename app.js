import env from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import passport from "passport";
import flash from "connect-flash";
import { appConfig } from "./config/configuration.js";
import routes from "./routes/index.routes.js";
import flashConfig from "./infrastructure/flash.js";
import {
  LocalStrategy,
  serializeUser,
  deserializeUser,
} from "./infrastructure/auth/passport/index.js";
import session from "./infrastructure/session.js";
// import resendEmailLimiter from "./infrastructure/ratelimit.js";

const app = express();
const PORT = appConfig.port;

// app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log("Session:", req.session);
//   console.log("User:", req.user);
//   next();
// });

app.use(flash());
app.use(flashConfig);

passport.use("local", LocalStrategy);
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
app.use(routes);

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Listening to the port ${PORT}`);
// });

export default app;
