const bcrypt = require("bcrypt");
const db = require("../models");
const { User, Event, Work } = db;
const {
  usernameToJwtToken,
  JwtTokenTousername,
} = require("../middlewares/auth");

const userController = {
  getAllUsers: async (req, res) => {
    // 抓所有使用者
    let users;
    try {
      users = await User.findAll({
        where: {
          isDeleted: 0,
        },
      });
    } catch (err) {
      return res.status(500).json({ ok: 0, message: err });
    }
    // 檢查是否為空
    if (users.length === 0) {
      return res.status(500).json({ ok: 0, message: "目前沒有使用者喔" });
    }
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      data: {
        users,
      },
    });
  },

  register: (req, res) => {
    const { username, password, nickname, email, session, contact } = req.body;
    // 檢查漏填
    if (!username || !password || !nickname || !email || !session || !contact) {
      return res.status(500).json({
        ok: 0,
        message: "有東西漏填了",
      });
    }
    // 檢查帳號存在
    User.findOne({ where: { username } })
      .then((user) => {
        if (user)
          return res.status(500).json({
            ok: 0,
            message: "帳號已經存在",
          });
      })
      .catch((err) => {
        return res.status(500).json({ ok: 0, message: err });
      });
    // 都沒問題，創立帳號
    bcrypt.hash(password, 10, (err, hash) => {
      User.create({
        username,
        password: hash,
        nickname,
        email,
        session,
        contact,
      })
        .then(() => {
          // 沒問題，直接發 token
          return res.status(200).json({
            ok: 1,
            token: usernameToJwtToken(username),
          });
        })
        .catch((err) => {
          return res.status(500).json({ ok: 0, message: err });
        });
    });
  },

  login: async (req, res) => {
    const { username, password } = req.body;
    // 檢查空值
    if (!username || !password) {
      return res.status(500).json({
        ok: 0,
        message: "有東西漏填了",
      });
    }
    // 撈出 user 的資料
    let user;
    try {
      user = await User.findOne({
        where: {
          username,
        },
      });
    } catch (err) {
      return res.status(500).json({ ok: 0, message: err });
    }
    if (!user) {
      return res.status(500).json({ ok: 0, message: "此帳號不存在" });
    }
    // 確認 user 的密碼
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ ok: 0, message: err });
      }
      if (!result) {
        return res.status(500).json({ ok: 0, message: "密碼錯誤" });
      }
      return res.status(200).json({
        ok: 1,
        token: usernameToJwtToken(username),
      });
    });
  },

  logout: (req, res) => {
    return res.status(200).json({
      ok: 1,
      message: "登出成功",
    });
  },

  getMe: (req, res) => {
    User.findOne({
      where: {
        username: res.locals.username,
      },
    })
      .then((user) => {
        return res.status(200).json({
          ok: 1,
          data: {
            user,
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({ ok: 0, message: err });
      });
  },

  updateMe: async (req, res) => {
    const {
      username,
      nickname,
      email,
      session,
      contact,
      record,
      description,
    } = req.body;
    // 檢查漏填
    if (!username || !nickname || !email || !session || !contact) {
      return res.status(500).json({
        ok: 0,
        message: "有東西漏填了",
      });
    }
    // 修改資料
    User.update(
      { username, nickname, email, session, contact, record, description },
      { where: { username: res.locals.username } }
    )
      .then((user) => {
        return res.status(200).json({
          ok: 1,
          message: "更新成功",
        });
      })
      .catch((err) => {
        return res.status(500).json({ ok: 0, message: err });
      });
  },

  updatePassword: async (req, res) => {
    const { oldPassword, newPassword, againPassword } = req.body;
    if (!oldPassword || !newPassword || !againPassword) {
      return res.status(500).json({
        ok: 0,
        message: "有東西漏填了",
      });
    }
    // 拿到使用者資料 -> 比對密碼
    let user;
    try {
      user = await User.findOne({
        where: {
          username: res.locals.username,
        },
      });
    } catch (err) {
      return res.status(500).json({ ok: 0, message: `get user error ${err}` });
    }
    bcrypt.compare(oldPassword, user.password, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ ok: 0, message: `get hash error ${err}` });
      }
      if (!result) {
        return res.status(500).json({ ok: 0, message: "密碼錯誤" });
      }
    });
    // 檢查是否相符
    if (newPassword !== againPassword) {
      return res.status(500).json({
        ok: 0,
        message: "新密碼輸入不一致",
      });
    }
    // 沒有問題，開始 update
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        return res
          .status(500)
          .json({ ok: 0, message: `set hash error ${err}` });
      }
      User.update(
        { password: hash },
        { where: { username: res.locals.username } }
      )
        .then(() => {
          return res.status(200).json({
            ok: 1,
            message: "更新成功",
          });
        })
        .catch((err) => {
          return res.status(500).json({ ok: 0, message: `更新失敗 ${err}` });
        });
    });
  },

  getOneUser: async (req, res) => {
    let user;
    try {
      user = await User.findOne({
        where: {
          id: req.params.id,
          isDeleted: 0,
        },
      });
    } catch (err) {
      return res.status(500).json({ ok: 0, message: err });
    }
    // 檢查是否為空
    if (user.length === 0) {
      return res.status(500).json({ ok: 0, message: "使用者不存在" });
    }
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      data: {
        user,
      },
    });
  },
};

module.exports = userController;
