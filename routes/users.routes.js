const express = require("express");
const {
  register,
  refreshAccessToken,
  login,
  logout,
  getAllUsers,
  deleteUser,
} = require("../controllers/users.controller");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const { asyncWrapper } = require("../middlewares/wrapper");
const { body } = require("express-validator");
const { validator } = require("../middlewares/validation");
const { isTokenRevoked } = require("../middlewares/revokeToken");
const allowedTo = require("../middlewares/allowedTo");

router.get(
  "/",
  verifyToken,
  isTokenRevoked,
  allowedTo("ADMIN"),
  asyncWrapper(getAllUsers)
);

router.route("/register").post(
  [
    body("firstName")
      .notEmpty()
      .withMessage("first name is required")
      .isLength({ min: 3 })
      .withMessage("first name must be at least 3 characters long")
      .matches(/^[A-Za-z]+$/)
      .withMessage("first name can only contain letters"),
    body("lastName")
      .notEmpty()
      .withMessage("last name is required")
      .isLength({ min: 3 })
      .withMessage("last name must be at least 3 characters long")
      .matches(/^[A-Za-z]+$/)
      .withMessage("last name can only contain letter"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&_]/)
      .withMessage(
        "Password must contain at least one special character (@, $, !, %, *, ?, &, _)"
      )
      .not()
      .matches(/\s/)
      .withMessage("Password must not contain spaces"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  validator,
  asyncWrapper(register)
);
router
  .route("/login")
  .post(
    [
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email"),
      body("password").notEmpty().withMessage("password is required"),
    ],
    validator,
    asyncWrapper(login)
  );

router.route("/logout").post(verifyToken, isTokenRevoked, asyncWrapper(logout));

router.route("/token").post(refreshAccessToken);

router
  .route("/:id")
  .delete(verifyToken, isTokenRevoked, allowedTo("ADMIN"), deleteUser);

module.exports = router;
