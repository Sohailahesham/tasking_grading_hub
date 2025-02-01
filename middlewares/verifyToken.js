const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");

const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader) {
    const error = appError.create("token is required", 401, "FAIL");
    return next(error);
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    const error = appError.create("invalid token", 401, "FAIL");
    return next(error);
  }
};

module.exports = verifyToken;
