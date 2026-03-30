const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const JWT_EXPIRES = "4h";
const COOKIE_MAX_MS = 4 * 60 * 60 * 1000;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: COOKIE_MAX_MS,
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

module.exports = {
  COOKIE_NAME,
  JWT_EXPIRES,
  signToken,
  setAuthCookie,
  clearAuthCookie,
};
