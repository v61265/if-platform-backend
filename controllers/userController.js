const bcrypt = require("bcrypt");
const db = require("../models");
const { User, EmailTime } = db;
const { usernameToJwtToken } = require("../middlewares/auth");

const userController = {
  getAllUsers: (req, res, next) => {
    /* 篩選器施工中
    const { _expand } = req.query;
    let expand;
    switch (_expand) {
      case all: {
        expand = { all: true };
        break;
      }
		}
		*/
    User.findAll({
      where: {
        isDeleted: 0,
      },
      include: { all: true },
    })
      .then((users) => {
        // 檢查是否為空
        if (users.length === 0) {
          next(new Error("目前沒有使用者喔"));
        }
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          data: {
            users,
          },
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  register: (req, res, next) => {
    console.log("start register");
    const {
      username,
      password,
      passwordAgain,
      nickname,
      email,
      session,
    } = req.body;
    // 檢查漏填
    if (
      !username ||
      !password ||
      !passwordAgain ||
      !nickname ||
      !email ||
      !session
    ) {
      next(new Error("有東西漏填囉"));
    }
    // 檢查帳號存在
    User.findOne({ where: { username } })
      .then((user) => {
        if (user) next(new Error("帳號已經存在"));
      })
      .catch((err) => {
        next(new Error(err));
      });
    // 檢查兩次密碼是否一致
    if (password !== passwordAgain) {
      console.log("密碼不一致");
      next(new Error("密碼輸入不一致"));
    }
    // 都沒問題，創立帳號
    bcrypt.hash(password, 10, (err, hash) => {
      User.create({
        username,
        password: hash,
        nickname,
        email,
        session,
      })
        .then(() => {
          // 沒問題，直接發 token
          return res.status(200).json({
            ok: 1,
            token: usernameToJwtToken(username),
          });
        })
        .catch((err) => {
          next(new Error(err));
        });
    });
  },

  login: async (req, res, next) => {
    const { username, password } = req.body;
    // 檢查空值
    if (!username || !password) {
      next(new Error("有東西漏填囉"));
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
      next(new Error(err));
    }
    if (!user) {
      next(new Error("此帳號不存在"));
    }
    // 確認 user 的密碼
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        next(new Error(err));
      }
      if (!result) {
        next(new Error("密碼錯誤"));
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

  getUser: (req, res, next) => {
    const path = req.path;
    if (path === "/getMe") {
      action = {
        where: {
          username: res.locals.username,
        },
        include: EmailTime,
      };
    } else {
      action = {
        where: {
          id: req.params.id,
        },
        include: EmailTime,
      };
    }
    User.findOne(action)
      .then((user) => {
        console.log(user);
        // 檢查是否為空
        if (!user) {
          next(new Error("找不到該使用者"));
        }
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          data: {
            user,
          },
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  updateMe: async (req, res, next) => {
    //叫出使用者資料
    let user;
    try {
      user = await User.findOne({
        where: { username: res.locals.username },
        include: EmailTime,
      });
      if (!user) {
        next(new Error("找不到這個使用者"));
      }
    } catch (err) {
      next(new Error(err));
    }
    const username = user.username;
    const nickname = req.body.nickname || user.nickname;
    const email = req.body.email || user.email;
    const session = req.body.session || user.session;
    const contact = req.body.contact || user.contact;
    const record = req.body.record || user.record;
    const description = req.body.description || user.description;
    const emailTime = req.body.emailTime || user.emailTime;
    // 檢查漏填
    if (!username || !nickname || !email || !session) {
      next(new Error("有東西漏填了"));
    }
    // 修改資料
    User.update(
      {
        username,
        nickname,
        email,
        session,
        contact,
        record,
        description,
        emailTime,
      },
      { where: { username: res.locals.username } }
    )
      .then((user) => {
        return res.status(200).json({
          ok: 1,
          message: "更新成功",
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  updatePassword: async (req, res, next) => {
    const { oldPassword, newPassword, againPassword } = req.body;
    if (!oldPassword || !newPassword || !againPassword) {
      next(new Error("有東西漏填囉"));
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
      next(new Error(err));
    }
    bcrypt.compare(oldPassword, user.password, (err, result) => {
      if (err) {
        next(new Error(err));
      }
      if (!result) {
        next(new Error("密碼錯誤"));
      }
    });
    // 檢查是否相符
    if (newPassword !== againPassword) {
      next(new Error("兩次密碼不一致"));
    }
    // 沒有問題，開始 update
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        next(new Error(err));
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
          next(new Error(err));
        });
    });
  },

  updateUser: async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
      user = await User.findOne({
        where: { id },
      });
      if (!user) {
        next(new Error("找不到這個使用者"));
      }
    } catch (err) {
      next(new Error(err));
    }
    const username = user.username;
    const nickname = req.body.nickname || user.nickname;
    const email = req.body.email || user.email;
    const session = req.body.session || user.session;
    const contact = req.body.contact || user.contact;
    const record = req.body.record || user.record;
    const description = req.body.description || user.description;
    const role = req.body.role || user.role;
    // 檢查漏填
    if (!username || !nickname || !email || !session) {
      next(new Error("有東西漏填了"));
    }
    // 修改資料
    User.update(
      {
        username,
        nickname,
        email,
        session,
        contact,
        record,
        description,
        role,
      },
      { where: { id } }
    )
      .then(() => {
        return res.status(200).json({
          ok: 1,
          message: "更新成功",
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },
};

module.exports = userController;
