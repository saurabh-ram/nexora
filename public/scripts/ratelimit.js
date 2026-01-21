import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./database.js";

/* 
 *NOTE:
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
    req.body.email
      ? req.body.email.trim().toLowerCase()
      : ipKeyGenerator(req),
  // message sent as response when handler is not defined -> res.status(429).send(message)
  message: "Too many resend requests from this IP, please try again later.",
  //handler overrides "message"
  handler: (req, res) => {
    req.flash('error', "You've requested too many verification emails. Please wait 15 minutes.");
    res.redirect('/login');
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const resendEmailRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(3, "15 m"),
    prefix: "rl:verify",
})

export default resendEmailLimiter;

export { resendEmailRateLimiter };
