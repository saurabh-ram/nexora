import express from "express";
import multer, { memoryStorage } from "multer";
import fs from "fs";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import db, { redis, schema } from "./database.js";
import env from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
// import session from "express-session";
import cloudinaryModule from "./mediahandler.js";
import streamifier from "streamifier";
import flash from "connect-flash";
import { domainName } from "../../config/app.config.js";
import LocalStrategy from "../../scripts/passport/passport.js";
import session from "../../scripts/session.js";
import { port } from "../../config/app.config.js";
import flashConfig from "../../scripts/flash.js";
import appconfig from "../../config/app.config.js";
// import resendEmailLimiter from "./ratelimit.js";
import { resendEmailRateLimiter } from "./ratelimit.js";

const app = express();
const port = appconfig.port;
// const domainName = "http://localhost:4000";
// const __dirName = path.dirname(fileURLToPath(import.meta.url));
// const saltRounds = 10;
// env.config();

app.use(express.static("public"));
// app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

app.use(flash());

app.use(flashConfig);

passport.use("local", LocalStrategy);

// passport.use("google", GoogleStrategy); 

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening to the port ${port}`);
});
