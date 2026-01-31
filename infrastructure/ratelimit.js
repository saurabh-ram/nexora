import { Ratelimit } from "@upstash/ratelimit";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { AUTH_PATHS } from "../constants/paths.constants.js";
import statuscodes from "../utils/statuscodes.js";
import { redis } from "./database.js";

/*
 * NOTE:
 * express-rate-limit uses in-memory storage by default.
 * To store rate-limit data in Redis, it requires a TCP-based Redis client
 * such as redis (v4), redis (v3), or ioredis.
 *
 * Upstash Redis (@upstash/redis) is REST-based and NOT compatible with
 *  express-rate-limit. For Upstash, use @upstash/ratelimit instead.
 */
const resendEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per window
  keyGenerator: (req) =>
    req.body.email ? req.body.email.trim().toLowerCase() : ipKeyGenerator(req),
  // message sent as response when handler is not defined -> res.status(429).send(message)
  message: statuscodes.ERROR_40020,
  //handler overrides "message"
  handler: (req, res) => {
    req.flash("error", statuscodes.ERROR_40008);
    res.redirect(AUTH_PATHS.LOGIN);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

async function checkRequestLimit(req, _res, email) {
  const key = email ? email.trim().toLowerCase() : req.ip;

  const { success } = await resendEmailRateLimiter.limit(key);

  if (!success) {
    req.flash(
      "error",
      "You've requested too many verification emails. Please wait 15 minutes.",
    );
    return false;
  }
  return true;
}

const resendEmailRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(3, "15 m"),
  prefix: "rl:verify",
});

export default resendEmailLimiter;

export { checkRequestLimit, resendEmailRateLimiter };

