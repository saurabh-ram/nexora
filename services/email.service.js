import nodemailer from "nodemailer";
import { appConfig } from "../config/configuration.js";
import { AUTH_PATHS } from "../constants/paths.constants.js";

// Function to send verification email
async function sendVerificationEmail(email, username, token) {
  const transporter = getTransporter();

  const verificationLink = getVerificationLink(token);

  const mailOptions = getMailOpriotions(email, username, verificationLink);

  await transporter.sendMail(mailOptions);
}

const getTransporter = () =>
  nodemailer.createTransport({
    service: appConfig.supportEmailProvider, // Use your email provider
    auth: {
      user: appConfig.supportEmailAddress,
      pass: appConfig.supportEmailPassword,
    },
  });

const getVerificationLink = (token) =>
  `${appConfig.domainName}${AUTH_PATHS.VERIFY_EMAIL}?token=${token}`;

const getMailOpriotions = (email, username, verificationLink) => {
  return {
    from: appConfig.supportEmailAddress,
    to: email,
    subject: "Verify Your Email",
    text: `Hello ${username},

Thank you for signing up! Please verify your email by clicking the link below:

${verificationLink}

If you did not sign up for this account, you can ignore this email.

Best,
Nexora Team`,
  };
};

export default { sendVerificationEmail };
