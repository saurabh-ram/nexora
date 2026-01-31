import crypto from "crypto";

const generate = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export { generate, hashToken };
