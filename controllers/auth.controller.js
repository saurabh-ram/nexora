import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { AUTH_PATHS, POST_PATHS } from "../constants/paths.constants.js";
import { checkRequestLimit } from "../infrastructure/ratelimit.js";
import authService from "../services/auth.service.js";
import statuscodes from "../utils/statuscodes.js";

const __dirName = path.dirname(fileURLToPath(import.meta.url));
const currentFolder = __dirName.split(path.sep).pop();

const getRegisterForm = (req, res) => {
  // let directoryName = __dirName.slice(0, -14);
  // res.sendFile(path.join(directoryName, "htmls", "register.html"));
  res.render("register.ejs", {
    /*isAuthenticated: true,*/
    page: "register",
    HOME: POST_PATHS.ALL_POSTS,
    REGISTER: AUTH_PATHS.REGISTER,
    LOGIN: AUTH_PATHS.LOGIN,
  });
};

const getLoginForm = (req, res) => {
  // let directoryName = __dirName.slice(0, -14);
  // res.sendFile(path.join(directoryName, "htmls", "login.html"));

  // Manual flash
  // const message = req.session.message;
  // delete req.session.message;
  // res.render("login.ejs", {
  //   /*isAuthenticated: true,*/
  //   page: "login",
  //   message: message,
  //   HOME: POST_PATHS.ALL_POSTS,
  //   LOGIN: AUTH_PATHS.LOGIN,
  //   REGISTER: AUTH_PATHS.REGISTER,
  //   RESEND_VERIFICATION_EMAIL: AUTH_PATHS.RESEND_VERIFICATION_EMAIL,
  // });

  res.render("login.ejs", {
    /*isAuthenticated: true,*/
    page: "login",
    HOME: POST_PATHS.ALL_POSTS,
    LOGIN: AUTH_PATHS.LOGIN,
    REGISTER: AUTH_PATHS.REGISTER,
    RESEND_VERIFICATION_EMAIL: AUTH_PATHS.RESEND_VERIFICATION_EMAIL,
  });
};

const login = passport.authenticate("local", {
  successRedirect: POST_PATHS.NEW_POST,
  failureRedirect: AUTH_PATHS.LOGIN,
  failureFlash: true,
  successFlash: true,
});

const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(POST_PATHS.ALL_POSTS);
  });
};

const registered = (req, res) => {
  // let directoryName = __dirName.slice(0, -14);
  const directoryName = __dirName.slice(0, -1 * currentFolder.length);
  res.sendFile(path.join(directoryName, "htmls", "registration_success.html"));
};

const registerUser = async (req, res) => {
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    await authService.register(req, res, {
      firstname,
      lastname,
      username,
      email,
      password,
    });
    // res.json({ message: statuscodes.SUCCESS_20001 });

    // req.session.message = {
    //   type: "success",
    //   text: statuscodes.SUCCESS_20001
    // };

    // req.login(user, (err) => {
    //   console.log(err);
    //   res.redirect(POST_PATHS.NEW_POST);
    // });

    req.flash("success", statuscodes.SUCCESS_20001);
    return res.redirect(AUTH_PATHS.LOGIN);
  } catch (err) {
    console.log(err);
    if (err.code === statuscodes.ERROR_40001) {
      req.flash("error", statuscodes.ERROR_40001);
      return res.status(400).redirect(AUTH_PATHS.LOGIN);
      // res.status(400).send(statuscodes.ERROR_40001);
    }
    req.flash("error", statuscodes.ERROR_40002);
    return res.status(500).redirect(AUTH_PATHS.REGISTER);
  }
};

const resendVerificationEmail = async (req, res) => {
  // nullish coalescing operator
  const email = req.body.email ?? "";

  try {
    if (email.trim() === "") {
      const error = new Error(statuscodes.ERROR_40007);
      error.code = statuscodes.ERROR_40007;
      throw error;
    }

    const isAllowed = await checkRequestLimit(req, res, email);

    if (!isAllowed) {
      return res.redirect(AUTH_PATHS.LOGIN);
    }

    await authService.checkAndResendVerificationEmail(email);
    req.flash(
      "success",
      "Verification link sent successfully! Check your email.",
    );
    return res.redirect(AUTH_PATHS.LOGIN);
  } catch (error) {
    if (error.code === statuscodes.ERROR_40007) {
      req.flash("error", statuscodes.ERROR_40007);
      return res.redirect(AUTH_PATHS.LOGIN);
    }
    if (error.code === statuscodes.ERROR_40005) {
      req.flash("error", statuscodes.ERROR_40005);
      return res.redirect(AUTH_PATHS.REGISTER);
    }
    if (error.code === statuscodes.ERROR_40006) {
      req.flash("error", statuscodes.ERROR_40006);
      return res.redirect(AUTH_PATHS.LOGIN);
    }
    req.flash("error", statuscodes.ERROR_40019);
    return res.status(500).redirect(AUTH_PATHS.LOGIN);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    await authService.verifyToken(token);
    req.flash("success", statuscodes.SUCCESS_20002);
    return res.redirect(AUTH_PATHS.LOGIN);
  } catch (error) {
    if (error.code === statuscodes.ERROR_40004) {
      req.flash("error", statuscodes.ERROR_40004);
      return res.status(400).redirect(AUTH_PATHS.LOGIN);
    }
    res.status(500).json({ error: "Error verifying email" });
  }
};

// // Google Oauth
// app.get("/auth/google", passport.authenticate("google", {
//   scope: ["profile", "email"],
// }));

// app.get(
//   "/auth/google/secrets",
//   passport.authenticate("google", {
//     successRedirect: POST_PATHS.NEW_POST,
//     failureRedirect: AUTH_PATHS.LOGIN,
// }));

export {
  getLoginForm,
  getRegisterForm,
  login,
  logout,
  registered,
  registerUser,
  resendVerificationEmail,
  verifyEmail
};

