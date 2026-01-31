export const serializeUser = (user, done) => {
  done(null, {
    id: user.user_id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    is_verified: user.is_verified,
  });
};
