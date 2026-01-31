import bcrypt from "bcrypt";
import statuscodes from "../utils/statuscodes.js";

const SALT_ROUNDS = 10;

const hashPasswordBcrypt = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) {
        console.error("Error hashing password: ", err);
        reject(err);
      }
      resolve(hash);
    });
  });
};

const hashPassword = async (password) => {
  try {
    const hashedPassword = await hashPasswordBcrypt(password);
    return hashedPassword;
  } catch (error) {
    throw new Error(statuscodes.ERROR_40017);
  }
};

// const verify = async (password, storedHashedPassword, cb) => {
//   console.log("Password Service cb1: " + cb);
//   console.log("Password: " + password + ", Stored hash: " + storedHashedPassword);
  
//   bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
//     console.log(err);
//     if (err) return cb(err);
//     console.log("isMatch: " + isMatch);
    
//     return isMatch
//       ? cb(null, user1)
//       : cb(null, false, { message: statuscodes.ERROR_40009 });
//   });
// };

const verify = async (password, storedHashedPassword) => {
  return bcrypt.compare(password, storedHashedPassword)
};

export default { hashPassword, verify };
