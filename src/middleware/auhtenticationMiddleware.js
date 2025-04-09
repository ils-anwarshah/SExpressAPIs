import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader;

  if (!token) {
    return res.status(401).json({
      message: "Access token is missing",
      code: "TOKEN_MISSING",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
        code: "TOKEN_INVALID",
      });
    }

    req.user = user;
    next();
  });
}
