const appError = require("../utils/appError");

module.exports = (...roles) => {
  console.log("roles", roles);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        appError.create("FORBIDDEN this role is not authorized", 403, "FAIL")
      );
    }
    next();
  };
};
