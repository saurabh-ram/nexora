import { AUTH_PATHS, POST_PATHS } from "../constants/paths.constants.js";
import { jsonCreator } from "../services/json.service.js";
import { getPoster, uploadToCloudinary } from "../services/media.service.js";
import postService from "../services/post.service.js";

// const domainName = "http://localhost:4000";

const getAllPosts = async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const posts = await postService.getAll(jsonCreator.SNAKE_CASE);
  const latestPost = await postService.getLatestPost(jsonCreator.SNAKE_CASE);
  res.render("home.ejs", {
    isAuthenticated: isAuthenticated,
    page: "home",
    posts: posts,
    latestPost: latestPost,
    HOME: POST_PATHS.ALL_POSTS,
    NEW_POST: POST_PATHS.NEW_POST,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
    LOGOUT: AUTH_PATHS.LOGOUT,
  });
};

// Yet to be implemented
const updatePost = async (req, res) => {
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
};

const getNewPostForm = (req, res) => {
  // console.log(req.user);
  // isAuthenticated() comes from "passport"
  if (req.isAuthenticated()) {
    res.render("newpost.ejs", {
      isAuthenticated: true,
      page: "newPost",
      HOME: POST_PATHS.ALL_POSTS,
      REGISTER: AUTH_PATHS.REGISTER,
      LOGIN: AUTH_PATHS.LOGIN,
      LOGOUT: AUTH_PATHS.LOGOUT,
    });
  } else {
    res.redirect(AUTH_PATHS.LOGIN);
  }
};

const getPostById = async (req, res) => {
  let id = req.params.id;
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const post = await postService.getById(id, jsonCreator.CAMEL_CASE);

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
    page: "fullReview",
    HOME: POST_PATHS.ALL_POSTS,
    NEW_POST: POST_PATHS.NEW_POST,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
    LOGOUT: AUTH_PATHS.LOGOUT,
  });
};

const createNewPost = async (req, res) => {
  const title = req.body["title"];
  const content = req.body["content"];
  const poster = getPoster(req.file);
  const labels = req.body["labels"];
  const releaseDate = req.body["releaseDate"];
  const releaseYear = req.body["releaseYear"];
  const authorId = req.user["user_id"];
  const url = req.file
    ? await uploadToCloudinary(req.file)
    : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  console.log("Post Controller -> authorId: " + authorId);
  const result = await postService.createPost({
    title,
    content,
    poster,
    url,
    labels,
    releaseDate,
    releaseYear,
    authorId,
  });
  res.redirect(POST_PATHS.ALL_POSTS);
};

const getLatestPost = async (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  const post = await postService.getLatestPost(jsonCreator.CAMEL_CASE);

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
    page: "latestPost",
    HOME: POST_PATHS.ALL_POSTS,
    NEW_POST: POST_PATHS.NEW_POST,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
    LOGOUT: AUTH_PATHS.LOGOUT,
  });
};

export {
  createNewPost,
  getAllPosts,
  getLatestPost,
  getNewPostForm,
  getPostById,
  updatePost,
};
