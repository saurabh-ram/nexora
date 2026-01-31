import path from "path";
// import { resolve } from "path";
import { fileURLToPath } from "url";
import { AUTH_PATHS, POST_PATHS } from "../constants/paths.constants.js";

// const domainName = "http://localhost:4000";
const __dirName = path.dirname(fileURLToPath(import.meta.url));
const currentFolder = __dirName.split(path.sep).pop();

const getInDevelopmentPage = (req, res) => {
  let directoryName = __dirName.slice(0, -1 * currentFolder.length);
  res.sendFile(path.join(directoryName, "htmls", "comingsoon.html"));
};

const getAboutPage = (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  res.render("about.ejs", {
    isAuthenticated: isAuthenticated,
    page: "about",
    HOME: POST_PATHS.ALL_POSTS,
    NEW_POST: POST_PATHS.NEW_POST,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
    LOGOUT: AUTH_PATHS.LOGOUT,
  });
};

const getContactPage = (req, res) => {
  let isAuthenticated = false;
  if (req.user) isAuthenticated = true;
  res.render("contact.ejs", {
    isAuthenticated: isAuthenticated,
    page: "contact",
    HOME: POST_PATHS.ALL_POSTS,
    NEW_POST: POST_PATHS.NEW_POST,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
    LOGOUT: AUTH_PATHS.LOGOUT,
  });
};

export { getAboutPage, getContactPage, getInDevelopmentPage };

