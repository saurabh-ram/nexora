import { Strategy } from "passport-local";
import authService from "../../../services/auth.service.js";
import statuscodes from "../../../utils/statuscodes.js";

/**
 *
 * Don't do this ✘
 * cb(error, false, { message: "Unexpected error" });
 *
 * expected failure ✔
 * cb(null, false, { message: "Invalid password" });
 *
 * unexpected error [System errors (cb(err)) skip flash] ✔
 * cb(error);
 *
 * success with message ✔
 * cb(null, user, { message: "Welcome back!" });
 *
 */
const LocalStrategy = new Strategy(async function verify(
  username,
  password,
  cb,
) {
  try {
    const user = await authService.authenticate(username, password, cb);
    return cb(null, user);
  } catch (err) {
    if (err.code === statuscodes.ERROR_40011) {
      return cb(null, false, { message: statuscodes.ERROR_40011 });
    } else if (err.code === statuscodes.ERROR_40009) {
      return cb(null, false, { message: statuscodes.ERROR_40009 });
    } else if (err.code === statuscodes.ERROR_40010) {
      return cb(null, false, { message: statuscodes.ERROR_40010 });
    }
    return cb(err);
  }
});

export { LocalStrategy };
