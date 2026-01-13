export const COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 20 * 1000, // 20 seconds
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/refresh",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
