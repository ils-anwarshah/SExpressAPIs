import jwt from "jsonwebtoken";

export default function authenticateTokenForSchool(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader;

  if (!token) {
    return res.status(401).json({
      message: "Access token is missing",
      code: "TOKEN_MISSING",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_FOR_SCHOOl, (err, user) => {
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
