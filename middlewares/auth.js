const jwt = require("jsonwebtoken");
const db = require("../models");
const { User, Work, User_Event, User_Work } = db;
require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET;
const { Unauthorized, NotFound } = require("./error");

const usernameToJwtToken = (username) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, jwtSecretKey);
};

const JwtTokenTousername = (token) => {
  const payload = jwt.verify(token.toString(), jwtSecretKey);
  if (!payload.username) return false;
  return payload.username;
};

const checkAuth = (auth) => async (req, res, next) => {
  let username, user;
  try {
    let jwtToken = req.header("Authorization").replace("Bearer ", "");
    username = JwtTokenTousername(jwtToken);
    user = await User.findOne({
      where: {
        username,
      },
    });
  } catch (err) {
    throw new Unauthorized(`請確認登入狀況 ${err}`);
  }

  switch (auth) {
    case "isLogin": {
      if (user.role !== "admin" && user.role !== "active-member") {
        throw new Unauthorized(
          "只有使用者可瀏覽該資料，請確認登入狀況或聯絡管理員"
        );
      }
      res.locals.userId = user.id;
      res.locals.username = username;
      next();
      break;
    }
    case "isAdmin": {
      if (user.role !== "admin")
        throw new Unauthorized("只有管理員才能瀏覽，你沒有足夠權限");
      res.locals.userId = user.id;
      res.locals.username = username;
      next();
      break;
    }
    case "isAuthor": {
      // 確認作者邏輯：撈出文章 id 對應的作者 id -> 比較
      const work = await Work.findOne({
        where: { id: req.params.id, isDeleted: 0 },
      });
      // 防止沒有文章
      if (!work) throw new NotFound("找不到該文章");
      // 防止非作者本人操作
      if (work.authorId !== user.id)
        throw new Unauthorized("只有作者才能操作，你沒有足夠權限");
      res.locals.userId = user.id;
      res.locals.username = username;
      next();
      break;
    }
    case "isReader": {
      const work = await Work.findOne({
        where: { id: req.params.id, isDeleted: 0 },
      });
      // 防止沒有文章
      if (!work) throw new NotFound("找不到該文章");
      // 檢查是不是作者
      if (work.authorId === user.id) {
        res.locals.userId = user.id;
        res.locals.username = username;
        return next();
      }
      // 檢查作品是否主動開放
      if (work.open) {
        res.locals.userId = user.id;
        res.locals.username = username;
        return next();
      }
      // 檢查是否參加作品所屬活動
      const eventId = work.eventId;
      const permitByEvent = await User_Event.findOne({
        where: {
          userId: user.id,
          eventId,
        },
      });
      if (permitByEvent) {
        res.locals.userId = user.id;
        res.locals.username = username;
        return next();
      }
      // 檢查是否個別開啟
      const permitByOther = await User_Work.findOne({
        where: {
          userId: user.id,
          workId: req.params.id,
        },
      });
      if (permitByOther) {
        res.locals.userId = user.id;
        res.locals.username = username;
        return next();
      }
      // 都不符合，不給過
      throw new Unauthorized("你沒有足夠權限閱讀該作品");
      break;
    }
  }
};

module.exports = {
  usernameToJwtToken,
  JwtTokenTousername,
  checkAuth,
};
