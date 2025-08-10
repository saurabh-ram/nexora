import express from "express";
import multer, { memoryStorage } from "multer";
import fs from "fs";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import db, { redis } from "./database.js";
import env from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import cloudinaryModule from "./mediahandler.js";
import streamifier from "streamifier";

const app = express();
const port = 4000;
const domainName = "http://localhost:4000";
const __dirName = path.dirname(fileURLToPath(import.meta.url));
const saltRounds = 10;
env.config();

app.use(express.static("public"));
// app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const schema = process.env.PG_SCHEMA;
const cloudinary = cloudinaryModule.cloudinary;

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
  console.log("User:", req.user);
  next();
});

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

app.get("/", async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  let posts = [];
  let latestPost;
  
  // Redis
  const cachedPosts = await redis.get(`homePosts`);
  if (cachedPosts) {
    if (typeof cachedPosts == "string") {
      posts = JSON.parse(cachedPosts);
    } else {
      posts = JSON.parse(JSON.stringify(cachedPosts)); //UpStash
    }
  } else {
    const postsObj = await db.query(`SELECT * FROM ${schema}.blog_posts ORDER BY id DESC;`);
    console.log(postsObj.rows);
    postsObj.rows.forEach((post) => {
      posts.push(createPostJSONSnakeCase(post));
    });
    // await redis.set(`homePosts`, JSON.stringify(posts), "EX", 3600); // Cache for 1 hour
    await redis.set(`homePosts`, JSON.stringify(posts), { ex: 3600 } ); // Cache for 1 hour
  }


  const cachedLatestPost = await redis.get(`homeLatestPost`)
  if (cachedLatestPost) {
    if (typeof cachedLatestPost == "string") {
      latestPost = JSON.parse(cachedLatestPost);
    } else {
      latestPost = JSON.parse(JSON.stringify(cachedLatestPost)); //UpStash
    }
  } else {
    const latestPostObj = await db.query(`SELECT * FROM ${schema}.blog_posts ORDER BY id DESC LIMIT 1;`);
    latestPost = createPostJSONSnakeCase(latestPostObj.rows[0]);
    // await redis.set(`homeLatestPost`, JSON.stringify(latestPost), "EX", 3600); // Cache for 1 hour
    await redis.set(`homeLatestPost`, JSON.stringify(latestPost), { ex: 3600 } ); // Cache for 1 hour
    // console.log(latestPostObj.rows);
    // console.log(latestPost);
  }

  res.render("home.ejs", { isAuthenticated: isAuthenticated, page: "home", posts: posts, latestPost: latestPost });
});

app.get("/latest-post", async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  let post;

  const cachedPost = await redis.get(`latestPost`)
  if (cachedPost) {
    if (typeof cachedPost == "string") {
      post = JSON.parse(cachedPost);
    } else {
      post = JSON.parse(JSON.stringify(cachedPost)); //UpStash
    }
  } else {
    const postObj = await db.query(`SELECT * FROM ${schema}.blog_posts ORDER BY id DESC LIMIT 1;`);
    post = createPostJSONCamelCase(postObj.rows[0]);
  
    // await redis.set(`latestPost`, JSON.stringify(post), "EX", 300); // Cache for 1 hour
    await redis.set(`latestPost`, JSON.stringify(post), { ex: 300 } ); // Cache for 1 hour
  }

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
  let post;

  const cachedPost = await redis.get(`blogpost:${id}`)
  if (cachedPost) {
    if (typeof cachedPost == "string") {
      post = JSON.parse(cachedPost);
    } else {
      post = JSON.parse(JSON.stringify(cachedPost)); //UpStash
    }
  } else {
    const postObj = await db.query(`SELECT * FROM ${schema}.blog_posts WHERE id = $1;`, [id]);
    // console.log(postObj);
    post = createPostJSONCamelCase(postObj.rows[0]);

    // await redis.set(`blogpost:${id}`, JSON.stringify(post), "EX", 3600); // Cache for 1 hour
    await redis.set(`blogpost:${id}`, JSON.stringify(post), { ex: 3600 } ); // Cache for 1 hour
  }

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
  const authorId = req.user["id"];
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
  // console.log(req.user);
  // isAuthenticated() comes from "passport"
  if (req.isAuthenticated()) {
    res.render("newpost.ejs", { isAuthenticated: true, page: "newPost" });
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  let directoryName = __dirName.slice(0, -14);
  res.sendFile(path.join(directoryName, "htmls", "register.html"));
});

app.get("/login", (req, res) => {
  let directoryName = __dirName.slice(0, -14);
  res.sendFile(path.join(directoryName, "htmls", "login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/new-post",
    failureRedirect: "/login",
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

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
      const result = await db.query(`SELECT * FROM ${schema}.users WHERE verification_token = $1`, [token]);

      if (result.rows.length === 0) {
          return res.status(400).json({ error: "Invalid or expired token" });
      }

      await db.query(`UPDATE ${schema}.users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1`, [token]);

      res.json({ message: "Email successfully verified!" });
  } catch (error) {
      res.status(500).json({ error: "Error verifying email" });
  }
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
      res.send("Email already exists. Try logging in.");
    } else {
      //Password Hashing
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password: ", err);
        } else {

          const verificationToken = uuidv4();
          const result = await db.query(
            `INSERT INTO ${schema}.users (firstname, lastname, username, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
            [firstname, lastname, username, email, hash, false, verificationToken]
          );

          const user = result.rows[0];

          await sendVerificationEmail(email, username, verificationToken);

          res.json({ message: "Registration successful! Check your email for verification." });
          
          req.login(user, (err) => {
            console.log(err);
            res.redirect("/new-post");
          })
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
});


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

  try {
      const result = await db.query(`SELECT * FROM ${schema}.users WHERE verification_token = $1`, [token]);

      if (result.rows.length === 0) {
          return res.status(400).json({ error: "Invalid or expired token" });
      }

      await db.query(`UPDATE ${schema}.users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1`, [token]);

      res.json({ message: "Email successfully verified!" });
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
  cb(null, { id: user1.id, firstname: user1.firstname, lastname: user1.lastname, username: user1.username, email: user1.email, is_verified: user1.is_verified });
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
