import db, { schema } from "../infrastructure/database.js";

const findByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.users WHERE email = $1`,
    [email],
  );
  return result;
};

const findByVerificationToken = async (hashedToken) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.users WHERE verification_token = $1;`,
    [hashedToken],
  );
  return result;
};

const saveUser = async (user) => {
  const {
    userid,
    firstname,
    lastname,
    username,
    email,
    hash,
    isVerified,
    verificationToken,
  } = user;
  const result = await db.query(
    `INSERT INTO ${schema}.users (user_id, firstname, lastname, username, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
    [
      userid,
      firstname,
      lastname,
      username,
      email,
      hash,
      isVerified,
      verificationToken,
    ],
  );
  return result;
};

const updateUser = async (user) => {
  const { email, hashedToken } = user;
  const result = await db.query(
    `UPDATE ${schema}.users SET verification_token = $1 WHERE email = $2 RETURNING *;`,
    [hashedToken, email],
  );
  return result;
};

const updateToken = async (user) => {
  const { email, hashedToken } = user;
  const result = await db.query(
    `UPDATE ${schema}.users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 AND email = $2 RETURNING *;`,
    [hashedToken, email],
  );
  return result;
};

export default {
  findByEmail,
  findByVerificationToken,
  saveUser,
  updateUser,
  updateToken,
};
