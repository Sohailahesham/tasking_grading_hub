const User = require("../models/User");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  revokeAccessToken,
} = require("../utils/generateJWT");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    status: "success",
    message: "All Users fetched successfully",
    data: { users },
  });
};

const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = AppError.create("User already exists", 409, "FAIL");
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  const accessToken = await generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: { user, accessToken, refreshToken },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = AppError.create("Incorrect Password", 401, "FAIL");
    return next(error);
  }
  const accessToken = await generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  user.refreshToken = refreshToken;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: { user, accessToken, refreshToken },
  });
};

const logout = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  user.refreshToken = "";
  await user.save();
  req.user = null;
  revokeAccessToken(req.headers.authorization.split(" ")[1]);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
    data: null,
  });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "User is deleted successfully",
    data: null,
  });
};

const refreshAccessToken = async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    const error = AppError.create(
      "An authorized token is missing",
      401,
      "FAIL"
    );
    next(error);
  }
  const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const accessToken = await generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  res.status(200).json({
    status: "success",
    message: "your access token refreshed successfully",
    data: { accessToken },
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getAllUsers,
  deleteUser,
};
