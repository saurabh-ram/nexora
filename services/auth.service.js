import userRepository from "../repositories/user.repository.js";
import statuscodes from "../utils/statuscodes.js";
import emailService from "./email.service.js";
import passwordService from "./password.service.js";
import { generate, hashToken } from "./token.service.js";
import { v7 as uuidv7 } from "uuid";

const register = async (req, res, user) => {
  const userid = uuidv7();
  const { firstname, lastname, username, email, password } = user;
  const checkResult = await userRepository.findByEmail(email);

  if (checkResult.rows.length > 0) {
    const error = new Error(statuscodes.ERROR_40001);
    error.code = statuscodes.ERROR_40001;
    throw error;
  } else {
    //Password Hashing
    const hash = await passwordService.hashPassword(password);
    const verificationToken = generate();
    const hashedToken = hashToken(verificationToken);
    const result = await userRepository.saveUser({
      userid,
      firstname,
      lastname,
      username,
      email,
      hash,
      isVerified: false,
      verificationToken: hashedToken,
    });

    await emailService.sendVerificationEmail(
      email,
      username,
      verificationToken,
    );
  }
};

const checkAndResendVerificationEmail = async (email) => {
  const checkResult = await userRepository.findByEmail(email);

  if (checkResult.rows.length === 0) {
    const error = new Error(statuscodes.ERROR_40005);
    error.code = statuscodes.ERROR_40005;
    throw error;
  } else if (checkResult.rows[0].is_verified) {
    const error = new Error(statuscodes.ERROR_40006);
    error.code = statuscodes.ERROR_40006;
    throw error;
  } else {
    const username = checkResult.rows[0].username;
    const verificationToken = generate();
    const hashedToken = hashToken(verificationToken);
    const result = await userRepository.updateUser({ email, hashedToken });

    await emailService.sendVerificationEmail(
      email,
      username,
      verificationToken,
    );
  }
};

const verifyToken = async (token) => {
  const hashedToken = hashToken(token);
  console.log("Verifying token...");

  const result = await userRepository.findByVerificationToken(hashedToken);
  if (result.rows.length === 0) {
    console.log("No matching token found in database.");
    const error = new Error(statuscodes.ERROR_40004);
    error.code = statuscodes.ERROR_40004;
    throw error;
  }

  await userRepository.updateToken({
    email: result.rows[0].email,
    hashedToken,
  });
};

const authenticate = async (email, password, cb) => {
  const result = await userRepository.findByEmail(email);
  const user = result.rows[0];

  if (!user) {
    const error = new Error(statuscodes.ERROR_40011);
    error.code = statuscodes.ERROR_40011;
    throw error;
  }

  const isValid = await passwordService.verify(password, user.password, cb);

  if (!isValid) {
    const error = new Error(statuscodes.ERROR_40009);
    error.code = statuscodes.ERROR_40009;
    throw error;
  }

  if (!user.is_verified) {
    const error = new Error(statuscodes.ERROR_40010);
    error.code = statuscodes.ERROR_40010;
    throw error;
  }

  return user;
};

const authenticateWithGoogle = async (profile) => {
  const email = profile.email;
  let user = await userRepository.findByEmail(email);
  if (!user || user.rows.length === 0) {
    const userName = email.split("@")[0];
    user = await userRepository.saveUser({
      userid: uuidv7(),
      firstname: "App",
      lastname: "User",
      userName,
      email,
      password: null,
      isVerified: true,
      verificationToken: null,
    });
  }
  return user;
};

export default {
  register,
  checkAndResendVerificationEmail,
  verifyToken,
  authenticate,
  authenticateWithGoogle,
};
