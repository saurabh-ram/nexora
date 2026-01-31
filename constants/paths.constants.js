const AUTH_PATHS = Object.freeze({
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REGISTERED: "/auth/registered",
  VERIFY_EMAIL: "/auth/verify/verify-email",
  RESEND_VERIFICATION_EMAIL: "/auth/verify/resend",
});

const POST_PATHS = Object.freeze({
  ALL_POSTS: "/posts",
  NEW_POST: "/posts/new-post",
  LATEST_POST: "/posts/latest-post",
});

export { AUTH_PATHS, POST_PATHS };