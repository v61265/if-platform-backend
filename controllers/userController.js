const bcrypt = require("bcrypt");
const db = require("../models");
const { User, EmailTime, Event, Work } = db;
const { usernameToJwtToken } = require("../middlewares/auth");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const getFilterByQuery = (queries, condition, attribute) => {
  let {
    _offset,
    _limit,
    _sort,
    _order,
    _expand_host,
    _expand_participate,
    _expand_works,
    _expand_readRecord,
    _expand_emailTime,
    _expand_all,
  } = queries;
  // 選擇 expand 哪些項目
  let expand = [];
  if (_expand_all) expand.push({ all: true });
  if (_expand_host) expand.push({ model: Event, as: "host" });
  if (_expand_participate) expand.push({ model: Event, as: "participate" });
  if (_expand_works) expand.push({ model: Work, as: "works" });
  if (_expand_readRecord) expand.push({ model: Work, as: "readRecord" });
  if (_expand_emailTime) expand.push({ model: EmailTime });
  return {
    where: condition,
    include: expand,
    offset: _offset ? parseInt(_offset) : 0,
    limit: _limit ? parseInt(_limit) : 10,
    order: [[_sort || "session", _order || "DESC"]],
    attributes: attribute,
  };
};

const emailIsValid = (email) => {
  const reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return reg.test(email);
};

const sessionIsValid = (session) => {
  const reg = /^(gs|if)_([0-1]\d)$/;
  return reg.test(session);
};

const userController = {
  getAllUsers: (req, res, next) => {
    const query = getFilterByQuery(
      req.query,
      { isDeleted: 0 },
      { exclude: ["password", "email"] }
    );
    User.findAll(query)
      .then((users) => {
        // 檢查是否為空
        if (users.length === 0) {
          next(new Error("目前沒有使用者喔"));
        }
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          users,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  register: async (req, res, next) => {
    console.log("start register");
    const {
      username,
      password,
      againPassword,
      nickname,
      email,
      session,
    } = req.body;
    // 檢查漏填
    if (
      !username ||
      !password ||
      !againPassword ||
      !nickname ||
      !email ||
      !session
    ) {
      return next(new Error("有東西漏填囉"));
    }
    // 方便之後用 username 選取不會出錯，必須避開 me 這組 username
    if (username === "me") return next(new Error("不能用這個 username"));
    // 檢查信箱格式
    if (!emailIsValid(email)) return next(new Error("信箱格式錯誤"));
    // 檢查屆數格式
    if (!sessionIsValid(session)) return next(new Error("屆數格式錯誤"));
    // 檢查帳號存在
    User.findOne({ where: { username } })
      .then((user) => {
        if (user) next(new Error("帳號已經存在"));
      })
      .catch((err) => {
        return next(new Error(err));
      });
    // 檢查兩次密碼是否一致
    if (password !== againPassword) {
      console.log("密碼不一致");
      return next(new Error("密碼輸入不一致"));
    }
    // 都沒問題，創立帳號
    try {
      const hash = await bcrypt.hash(password, 10);
      const createUser = await User.create({
        username,
        password: hash,
        nickname,
        email,
        session,
      });
      // 拿到新使用者 id
      const userId = await User.findOne({
        where: { username },
      }).then((res) => res.id);
      console.log(userId);
      // 新增收信時機
      const createEmailTime = await EmailTime.create({
        userId,
        eventCreated: true,
        eventUpdated: true,
        eventRemain: true,
        eventSignUp: true,
        eventAlternate: true,
        postSuccess: true,
        postComment: true,
      });
      // 沒問題，直接發 token
      return res.status(200).json({
        ok: 1,
        token: usernameToJwtToken(username),
      });
    } catch (err) {
      next(new Error(err));
    }
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

  getUser: (req, res, next) => {
    const path = req.path;
    let username;
    let exclude;
    if (path === "/me") {
      username = res.locals.username;
      exculd = ["password"];
    } else {
      username = req.params.username;
      exculd = ["password", "email"];
    }
    query = getFilterByQuery(
      req.query,
      {
        username,
        isDeleted: 0,
      },
      { exclude }
    );
    User.findOne(query)
      .then((user) => {
        console.log(user);
        // 檢查是否為空
        if (!user) {
          next(new Error("找不到該使用者"));
        }
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          user,
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
    const portrait = req.body.portrait || user.portrait;
    const description = req.body.description || user.description;
    const emailTime = req.body.emailTime || user.emailTime;
    // 檢查漏填
    if (!username || !nickname || !email || !session) {
      next(new Error("有東西漏填了"));
    }
    // 檢查信箱格式
    if (!emailIsValid(email)) return next(new Error("信箱格式錯誤"));
    // 檢查屆數格式
    if (!sessionIsValid(session)) return next(new Error("屆數格式錯誤"));
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
        portrait,
      },
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
    const id = req.params.username;
    let user;
    try {
      user = await User.findOne({
        where: { username },
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
    const portrait = req.body.portrait || user.portrait;
    // 檢查漏填
    if (!username || !nickname || !email || !session) {
      next(new Error("有東西漏填了"));
    }
    // 檢查信箱格式
    if (!emailIsValid(email)) return next(new Error("信箱格式錯誤"));
    // 檢查屆數格式
    if (!sessionIsValid(session)) return next(new Error("屆數格式錯誤"));
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
        portrait,
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

  searchUser: (req, res, next) => {
    let { _offset, _limit, _sort, _order, _keyword } = req.query;
    User.findAll({
      where: {
        [Op.or]: {
          username: { [Op.regexp]: `[${_keyword}]` },
          nickname: { [Op.regexp]: `[${_keyword}]` },
        },
        isDeleted: 0,
      },
      offset: _offset ? parseInt(_offset) : 0,
      limit: _limit ? parseInt(_limit) : 10,
      order: [[_sort || "session", _order || "DESC"]],
      attributes: ["username", "nickname", "portrait"],
    })
      .then((users) => {
        // 檢查是否為空
        if (users.length === 0) {
          next(new Error("沒有搜尋結果"));
        }
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          users,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  updateMyEmailTime: (req, res, next) => {
    let {
      eventCreated,
      eventUpdated,
      eventRemain,
      eventSignUp,
      eventAlternate,
      postSuccess,
      postComment,
    } = req.body;
    // 修改資料
    EmailTime.update(
      {
        eventCreated,
        eventUpdated,
        eventRemain,
        eventSignUp,
        eventAlternate,
        postSuccess,
        postComment,
      },
      { where: { userId: res.locals.userId } }
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
