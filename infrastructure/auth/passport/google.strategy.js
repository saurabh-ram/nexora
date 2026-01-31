import GoogleStrategy from "passport-google-oauth2";
import { appConfig, authConfig } from "../../config/configuration.js";
import authService from "../../services/auth.service.js";

const GoogleStrategy = new GoogleStrategy(
  {
    clientID: authConfig.clientId,
    clientSecret: authConfig.clientSecret,
    callbackURL: `${appConfig.domainName}/auth/google/secrets`,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log(profile);
    try {
      const user = await authService.authenticateWithGoogle(profile);
      done(null, user.rows[0]);
    } catch (error) {
      done(error);
    }
  },
);
