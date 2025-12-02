import jwt from "jsonwebtoken";

const COOKIE_NAME = "chore_jwt";

export function setAuthCookie(res, user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      is_ra: user.is_ra,
    },
    secret,
    { expiresIn: "7d" }
  );
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "not authenticated" });
  }
  try {
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.id,
      username: payload.username,
      is_ra: payload.is_ra,
    };
    next();
  } catch (e) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}
