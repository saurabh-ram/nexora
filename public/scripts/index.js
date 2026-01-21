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
import session from "express-session";
import cloudinaryModule from "./mediahandler.js";
import streamifier from "streamifier";
import flash from "connect-flash";
// import resendEmailLimiter from "./ratelimit.js";
import { resendEmailRateLimiter } from "./ratelimit.js";

const app = express();
const port = 4000;
const domainName = "http://localhost:4000";
const __dirName = path.dirname(fileURLToPath(import.meta.url));
const saltRounds = 10;
env.config();

app.use(express.static("public"));
// app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("Session:", req.session);
  // console.log("User:", req.user);
  next();
});

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cloudinary = cloudinaryModule.cloudinary;

function createPostJSONCamelCase(post) {
  const id = post["id"];
  const title = post["title"];
  const content = post["content"];
  const poster = post["poster"];
  const imageUrl = post["image_url"];
  const transformation = post["transformation"];
  const labelsString = post["labels"];
  const releaseDateISO = post["release_date"];
  const releaseYear = post["release_year"];
  const authorId = post["author_id"]
  const createdDateISO = post["created_date"];

  const base64Image = `data:image/jpeg;base64,${poster.toString("base64")}`;
  const labels = labelsString.split(", ");
  const [rd, rm, ry] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(releaseDateISO).split(" ");
  const releaseDate = `${rd} ${rm}, ${ry}`;
  const [cd, cm, cy] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(createdDateISO).split(" ");
  const createdDate = `${cd} ${cm}, ${cy}`;

  const transformedUrl = imageUrl ? imageUrl.replace('/upload/', `/upload/${transformation}/`) : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  return {
    id: id,
    title: title,
    content: content,
    poster: base64Image,
    labels: labels,
    releaseDate: releaseDate,
    releaseYear: releaseYear,
    authorId: authorId,
    createdDate: createdDate,
    imageUrl: transformedUrl,
  }
}

function createPostJSONSnakeCase(post) {
  const id = post["id"];
  const title = post["title"];
  const content = post["content"];
  const poster = post["poster"];
  const imageUrl = post["image_url"];
  const transformation = post["transformation"];
  const labelsString = post["labels"];
  const releaseDateISO = post["release_date"];
  const releaseYear = post["release_year"];
  const authorId = post["author_id"]
  const createdDateISO = post["created_date"];

  const base64Image = `data:image/jpeg;base64,${poster.toString("base64")}`;
  const labels = labelsString.split(", ");
  const [rd, rm, ry] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(releaseDateISO).split(" ");
  const releaseDate = `${rd} ${rm}, ${ry}`;
  const [cd, cm, cy] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(createdDateISO).split(" ");
  const createdDate = `${cd} ${cm}, ${cy}`;

  const transformedUrl = imageUrl ? imageUrl.replace('/upload/', `/upload/${transformation}/`) : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  return {
    post_id: id,
    title: title,
    content: content,
    poster: base64Image,
    labels: labels,
    release_date: releaseDate,
    release_year: releaseYear,
    author_id: authorId,
    created_date: createdDate,
    image_url: transformedUrl,
  }
}

async function uploadToCloudinary(file, folderName = "posters") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: folderName,
      },
      (error, result) => {
        if (error) return reject(error);
        console.log(result);
        return resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

async function cachePosts(key, query, queryParams, jsonCreator) {
  let posts = [];

  // Redis
  const cachedPosts = await redis.get(key);
  if (cachedPosts) {
    if (typeof cachedPosts == "string") {
      posts = JSON.parse(cachedPosts);
    } else {
      posts = JSON.parse(JSON.stringify(cachedPosts)); //UpStash
    }
  } else {
    const resultRows = await db.query(query, normalizeParams(queryParams));
    console.log(resultRows.rows);
    resultRows.rows.forEach((post) => {
      posts.push(jsonCreator(post));
    });
    // await redis.set(key, JSON.stringify(posts), "EX", 3600); // Cache for 1 hour
    await redis.set(key, JSON.stringify(posts), { ex: 3600 } ); // Cache for 1 hour
  }
  return posts;
}

function normalizeParams(params) {
  if (params == null) return [];
  return Array.isArray(params) ? params : [params];
}

async function getPosts(key, query, queryParams, jsonCreator) {
  const posts = await cachePosts(key, query, queryParams, jsonCreator);
  return posts;
}

async function getPost(key, query, queryParams, jsonCreator) {
  const posts = await cachePosts(key, query, queryParams, jsonCreator);
  return posts[0];
}

app.get("/", async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const posts = await getPosts(`homePosts`,
    `SELECT * FROM ${schema}.blog_posts ORDER BY id DESC;`, 
    null,
    createPostJSONSnakeCase);
  const latestPost = await getPost(`homeLatestPost`,
    `SELECT * FROM ${schema}.blog_posts ORDER BY id DESC LIMIT 1;`,
    null,
    createPostJSONSnakeCase);

  // console.log(posts);
  res.render("home.ejs", { isAuthenticated: isAuthenticated, page: "home", posts: posts, latestPost: latestPost });
});

app.get("/latest-post", async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const post = await getPost(`latestPost`,
    `SELECT * FROM ${schema}.blog_posts ORDER BY id DESC LIMIT 1;`,
    null,
    createPostJSONCamelCase);

  res.render("full_review.ejs", {
    post_id: post["id"],
    title: post["title"],
    content: post["content"],
    poster: post["poster"],
    image_url: post["imageUrl"],
    labels: post["labels"],
    release_date: post["releaseDate"],
    release_year: post["releaseYear"],
    author_id: post["authorId"],
    created_date: post["createdDate"],
    isAuthenticated: isAuthenticated,
    page: "latestPost"
  });
})

app.get("/posts/:id", async (req, res) => {
  let id = req.params.id;
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const post = await getPost(`blogpost:${id}`,
    `SELECT * FROM ${schema}.blog_posts WHERE id = $1;`,
    [id],
    createPostJSONCamelCase);

  res.render("full_review.ejs", {
    post_id: post["id"],
    title: post["title"],
    content: post["content"],
    poster: post["poster"],
    image_url: post["imageUrl"],
    labels: post["labels"],
    release_date: post["releaseDate"],
    release_year: post["releaseYear"],
    author_id: post["authorId"],
    created_date: post["createdDate"],
    isAuthenticated: isAuthenticated,
    page: "fullReview"
  });
});

app.post("/posts", upload.single("poster"), async (req, res) => {
  const title = req.body["title"];
  const content = req.body["content"];
  const poster = req.file
    ? req.file.buffer : fs.readFileSync(path.join(__dirName.slice(0, -7), "images", "you_cant_see_me.jpg"));
  const labels = req.body["labels"];
  const releaseDate = req.body["releaseDate"];
  const releaseYear = req.body["releaseYear"];
  const authorId = req.user["user_id"];
  const url = req.file ? await uploadToCloudinary(req.file) : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  await db.query(
    `INSERT INTO ${schema}.blog_posts (title, content, poster, image_url, labels, release_date, release_year, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    [title, content, poster, url, labels, releaseDate, releaseYear, authorId]
  );
  res.redirect("/");
});

app.put("/posts", async (req, res) => {
  const title = req.body["title"];
  const content = req.body["content"];
  const releaseDate = req.body["releaseDate"];
  const releaseYear = req.body["releaseYear"];
  const createdDate = new Date().getDate();
  await db.query(`Update Query`, [
    title,
    content,
    null,
    releaseDate,
    releaseYear,
    createdDate,
    null,
  ]);
});

app.get("/new-post", (req, res) => {
  console.log(req.user);
  // isAuthenticated() comes from "passport"
  if (req.isAuthenticated()) {
    res.render("newpost.ejs", { isAuthenticated: true, page: "newPost" });
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  // let directoryName = __dirName.slice(0, -14);
  // res.sendFile(path.join(directoryName, "htmls", "register.html"));
  res.render("register.ejs", { /*isAuthenticated: true,*/ page: "register" });
});

app.get("/login", (req, res) => {
  // let directoryName = __dirName.slice(0, -14);
  // res.sendFile(path.join(directoryName, "htmls", "login.html"));

  // Manual flash
  // const message = req.session.message;
  // delete req.session.message;
  // res.render("login.ejs", { page: "login", message: message });

  res.render("login.ejs", { /*isAuthenticated: true,*/ page: "login" });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/new-post",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/registered", (req, res) => {
  let directoryName = __dirName.slice(0, -14);
  res.sendFile(path.join(directoryName, "htmls", "registration_success.html"));
})





// // Google Oauth
// app.get("/auth/google", passport.authenticate("google", {
//   scope: ["profile", "email"],
// }));

// app.get(
//   "/auth/google/secrets",
//   passport.authenticate("google", {
//     successRedirect: "/new-post",
//     failureRedirect: "/login",
// }));




app.post("/register", async (req, res) => {
  const userid = uuidv4();
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query(`SELECT * FROM ${schema}.users WHERE email = $1`, [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.flash("error", "Email already exists. Try logging in.");
      return res.redirect("/login");
      // res.send("Email already exists. Try logging in.");
    } else {
      //Password Hashing
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password: ", err);
        } else {

          const verificationToken = crypto.randomBytes(32).toString("hex");
          const hashedToken = hashToken(verificationToken);
          const result = await db.query(
            `INSERT INTO ${schema}.users (user_id, firstname, lastname, username, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
            [userid, firstname, lastname, username, email, hash, false, hashedToken]
          );

          await sendVerificationEmail(email, username, verificationToken);

          // res.json({ message: "Registration successful! Check your email for verification." });
          
          // req.session.message = {
          //   type: "success",
          //   text: "Registration successful! Check your email for verification."
          // };

          // req.login(user, (err) => {
          //   console.log(err);
          //   res.redirect("/new-post");
          // });

          req.flash("success", "Registration successful! Check your email for verification.");
          return res.redirect("/login");
        }
      });
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Registration failed. Please try again.");
    return res.status(500).redirect("/register");
  }
});

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

app.post("/verify/resend", /*resendEmailLimiter,*/ async (req, res) => {
  const email = req.body.email ?? "";

  if (email.trim() === "") {
    req.flash("error", "Please provide an email address to verify.");
    return res.redirect("/login");
  }

  const isAllowed = await checkRequestLimit(req, res, email);

  if (!isAllowed) {
    return res.redirect("/login");
  }

  try {
    const checkResult = await db.query(`SELECT * FROM ${schema}.users WHERE email = $1`, [
      email,
    ]);

    if (checkResult.rows.length === 0) {
      req.flash("error", "Email is not registered. Please register first.");
      return res.redirect("/register");
    } else if (checkResult.rows[0].is_verified) {
      req.flash("error", "Email is already verified. Try logging in.");
      return res.redirect("/login");
    } else {
      
      const username = checkResult.rows[0].username;
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashToken(verificationToken);
      const result = await db.query(
        `UPDATE ${schema}.users SET verification_token = $1 WHERE email = $2 RETURNING *;`,
        [hashedToken, email]
      );

      await sendVerificationEmail(email, username, verificationToken);

      req.flash("success", "Verification link sent successfully! Check your email.");
      return res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Verification failed. Please try again.");
    return res.status(500).redirect("/login");
  }
});

async function checkRequestLimit(req, res, email) {

  const key = email
  ? email.trim().toLowerCase()
  : req.ip;

  const { success } = await resendEmailRateLimiter.limit(key);

  if (!success) {
    req.flash(
      "error",
      "You've requested too many verification emails. Please wait 15 minutes."
    );
    return false;
  }
  return true;
}

// Function to send verification email
async function sendVerificationEmail(email, username, token) {
  const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email provider
      auth: {
          user: "nexorateamsp@gmail.com",
          pass: "lishzyvjlzguagbg",
      },
  });

  const verificationLink = `${domainName}/verify-email?token=${token}`;

  const mailOptions = {
      from: "nexorateamsp@gmail.com",
      to: email,
      subject: "Verify Your Email",
      text: `Hello ${username},

Thank you for signing up! Please verify your email by clicking the link below:

${verificationLink}

If you did not sign up for this account, you can ignore this email.

Best,
Nexora Team`,
  };

  await transporter.sendMail(mailOptions);
}

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  const hashedToken = hashToken(token);
  
  try {
      console.log("Verifying token...");
      const result = await db.query(`SELECT * FROM ${schema}.users WHERE verification_token = $1`, [hashedToken]);

      if (result.rows.length === 0) {
          console.log("No matching token found in database.");
          req.flash("error", "Invalid or expired token.");
          return res.status(400).redirect("/login");
      }

      await db.query(`UPDATE ${schema}.users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1`, [hashedToken]);

      req.flash("success", "Email verified successfully! You can now log in.");
      return res.redirect("/login");
  } catch (error) {
      res.status(500).json({ error: "Error verifying email" });
  }
});



passport.use("local", new Strategy(async function verify(username, password, cb) {
    try {
      // console.log(username, "    ", password);
      const result = await db.query(`SELECT * FROM ${schema}.users WHERE email = $1`, [
        username,
      ]);
      if (result.rows.length > 0) {
        const user1 = result.rows[0];
        const storedHashedPassword = user1.password;

        // Check if user is verified
        if (!user1.is_verified) {
          return cb(null, false, { message: "Email not verified. Please check your email." });
        }

        // Compare password
        bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
          if (err) return cb(err);
          return isMatch ? cb(null, user1) : cb(null, false, { message: "Invalid credentials" });
        });
      } else {
        return cb(null, false, { message: "User not found" });
      }
    } catch (err) {
      return cb(err);
    }
  })
);

// passport.use("google", new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: `${domainName}/auth/google/secrets`,
//   userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
// }, async (accessToken, refreshToken, profile, cb) => {
//   console.log(profile);
//   try {
//     const result = await db.query(`SELECT * FROM ${schema}.users WHERE email = $1;`, [profile.email]);
//     if (result.rows.length === 0) {
//       const userName = profile.email.split("@")[0];
//       const newUser = await db.query(
//         `INSERT INTO ${schema}.users (firstname, lastname, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
//         ["Nexora", "user", userName, profile.email, "google"]
//       );
//       cb(null, newUser.rows[0]);
//     } else {
//       //Already existing user
//       cb(null, result.rows[0]);
//     }
//   } catch (error) {
//     cb(error);
//   }
// })); 

passport.serializeUser((user1, cb) => {
  cb(null, { id: user1.user_id, firstname: user1.firstname, lastname: user1.lastname, username: user1.username, email: user1.email, is_verified: user1.is_verified });
});

passport.deserializeUser((user1, cb) => {
  cb(null, user1);
});

app.get("/in-development", (req, res) => {
  let directoryName = __dirName.slice(0, -14);
  res.sendFile(path.join(directoryName, "htmls", "comingsoon.html"));
});

app.get("/about", (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  res.render("about.ejs", { isAuthenticated: isAuthenticated, page: "about" });
});

app.get("/contact", (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  res.render("contact.ejs", { isAuthenticated: isAuthenticated, page: "contact" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening to the port ${port}`);
});
