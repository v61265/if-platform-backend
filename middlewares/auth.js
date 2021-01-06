const jwt = require("jsonwebtoken");
const db = require("../models");
const { User } = db;
require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET;

const usernameToJwtToken = (username) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, jwtSecretKey);
};

const JwtTokenTousername = (token) => {
  const payload = jwt.verify(token, jwtSecretKey);
  if (!payload.username) return false;
  return payload.username;
};

const checkAuth = (auth) => {
  return async (req, res, next) => {
    let username;
    try {
      let jwtToken = req.header("Authorization").replace("Bearer ", "");
      username = JwtTokenTousername(jwtToken);
    } catch (err) {
      return res.status(500).json({ ok: 0, message: "你沒有權限瀏覽此頁面" });
    }
    let user;
    try {
      user = await User.findOne({
        where: {
          username,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ ok: 0, message: `你沒有權限瀏覽此頁面 ${err}` });
    }
    switch (auth) {
      case "isLogin": {
        res.locals.username = username;
        next();
        break;
      }
      case "isAdmin": {
        if (user.role !== "admin") {
          return res
            .status(500)
            .json({ ok: 0, message: "你沒有權限瀏覽此頁面" });
        }
        res.locals.username = username;
        next();
        break;
      }
    }
  };
};

module.exports = {
  usernameToJwtToken,
  JwtTokenTousername,
  checkAuth,
};
