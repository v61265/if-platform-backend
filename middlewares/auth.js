const jwt = require("jsonwebtoken");
const db = require("../models");
const { User, Work, User_Event, User_Work } = db;
require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET;

const usernameToJwtToken = (username) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, jwtSecretKey);
};

const JwtTokenTousername = (token) => {
  console.log("進到這裡了！", jwtSecretKey);
  const payload = jwt.verify(token.toString(), jwtSecretKey);
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
      return res.status(500).json({ ok: 0, message: `身分認證失敗` });
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
        console.log(user.role);
        if (user.role !== "admin" && user.role !== "active-member") {
          return res
            .status(500)
            .json({ ok: 0, message: "你沒有權限瀏覽此頁面" });
        }
        res.locals.userId = user.id;
        res.locals.username = username;
        next();
        break;
      }
      case "isAdmin": {
        if (user.role !== "admin") {
          return res
            .status(500)
            .json({ ok: 0, message: "只有管理員才能瀏覽，你沒有足夠權限" });
        }
        res.locals.userId = user.id;
        res.locals.username = username;
        next();
        break;
      }
      case "isAuthor": {
        // 確認作者邏輯：撈出文章 id 對應的作者 id -> 比較
        Work.findOne({ where: { id: req.params.id, isDeleted: 0 } })
          .then((work) => {
            // 防止抓錯文章
            if (!work)
              return res.status(500).json({
                ok: 0,
                message: "找不到該篇文章",
              });
            // 防止非作者本人操作
            if (work.authorId !== user.id) {
              return res.status(500).json({
                ok: 0,
                message: "只有作者本人才能操作，你沒有足夠權限",
              });
            }
            res.locals.userId = user.id;
            res.locals.username = username;
            next();
          })
          .catch((err) =>
            res
              .status(500)
              .json({ ok: 0, message: `身分認證好像出錯了： ${err}}` })
          );
        break;
      }
      case "isReader": {
        try {
          const work = await Work.findOne({
            where: { id: req.params.id, isDeleted: 0 },
          });
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
          return res
            .status(500)
            .json({ ok: 0, message: `你沒有權限閱讀此篇文章` });
        } catch (err) {
          return res
            .status(500)
            .json({ ok: 0, message: `身分認證好像出錯了： ${err}}` });
        }
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
