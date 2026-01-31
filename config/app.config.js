import env from "dotenv";

env.config();

const environment = process.env.ENVIRONMENT || "production";

if (environment === "production") {
  !process.env.DOMAIN_NAME
    ? console.error("DOMAIN_NAME is not set in production environment")
    : null;
}

const port = process.env.APP_PORT || 4000;
const domainName = process.env.DOMAIN_NAME || "http://localhost:4000";
const sessionSecret = process.env.SESSION_SECRET || "default_session_secret";

const supportEmailAddress = process.env.SUPPORT_EMAIL_ADDRESS;
const supportEmailPassword = process.env.SUPPORT_EMAIL_PASSWORD;
const supportEmailProvider = process.env.SUPPORT_EMAIL_PROVIDER || "gmail";

if (!supportEmailAddress || !supportEmailPassword) {
  console.error("Support email credentials are not set in secrets.");
}

console.log(`Application environment: ${environment}`);

export default {
  environment,
  domainName,
  port,
  sessionSecret,
  supportEmailAddress,
  supportEmailPassword,
  supportEmailProvider,
};
