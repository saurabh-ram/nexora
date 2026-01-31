import passport from "passport";
import { deserializeUser } from "./deserialize.js";
import { LocalStrategy } from "./local.strategy.js";
import { serializeUser } from "./serialize.js";

export { LocalStrategy, serializeUser, deserializeUser };
