require("dotenv").config();
const jwt = require("jsonwebtoken");

const blackList = new Set();

const generateAccessToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return token;
};

const generateRefreshToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const revokeAccessToken = async (accessToken) => {
  blackList.add(accessToken);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  revokeAccessToken,
  blackList,
};
