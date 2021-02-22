const bcrypt = require("bcrypt");
const db = require("../models");
const { User, EmailTime, Event, Work } = db;
const { usernameToJwtToken } = require("../middlewares/auth");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const {
  GeneralError,
  NotFound,
  MissingError,
  VarifyError,
} = require("../middlewares/error");

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
  getAllUsers: async (req, res) => {
    console.log("middleware: getAllUsers");
    const query = getFilterByQuery(
      req.query,
      { isDeleted: 0 },
      { exclude: ["password", "email"] }
    );
    const users = await User.findAll(query);
    if (users.length === 0) {
      throw new NotFound("目前沒有使用者");
    }
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      users,
    });
  },

  register: async (req, res) => {
    console.log("middleware: register");
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
      console.log(username, password, againPassword, nickname, email, session);
      throw MissingError;
    }
    // 方便之後用 username 選取不會出錯，必須避開 me 這組 username
    if (username === "me") throw new GeneralError("此帳號為預留字元");
    // 檢查信箱格式
    if (!emailIsValid(email)) throw new GeneralError("信箱格式錯誤");
    // 檢查屆數格式
    if (!sessionIsValid(session)) throw new GeneralError("屆數格式錯誤");
    // 檢查帳號存在
    const checkUsername = await User.findOne({ where: { username } });
    if (checkUsername) throw new GeneralError("帳號已存在");
    // 檢查兩次密碼是否一致
    if (password !== againPassword) throw new GeneralError("兩次密碼不一致");
    // 都沒問題，創立帳號
    const hash = await bcrypt.hash(password, 10);
    await db.sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          username,
          password: hash,
          nickname,
          email,
          session,
        },
        { transaction: t }
      );
      // 新增收信時機
      await EmailTime.create(
        {
          userId: user.id,
          eventCreated: true,
          eventUpdated: true,
          eventRemain: true,
          eventSignUp: true,
          eventAlternate: true,
          postSuccess: true,
          postComment: true,
        },
        { transaction: t }
      );
    });
    // 沒問題，直接發 token
    return res.status(200).json({
      ok: 1,
      token: usernameToJwtToken(username),
    });
  },

  login: async (req, res) => {
    console.log("middleware: login");
    const { username, password } = req.body;
    // 檢查空值
    if (!username || !password) throw MissingError;
    // 撈出 user 的資料
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (!user) throw VarifyError;
    // 確認 user 的密碼
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw VarifyError;
    return res.status(200).json({
      ok: 1,
      token: usernameToJwtToken(username),
    });
  },

  getUser: async (req, res) => {
    console.log("middleware: getUser");
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
    const user = await User.findOne(query);
    if (!user) throw new NotFound("找不到該使用者");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      user,
    });
  },

  updateMe: async (req, res) => {
    console.log("middleware: gupdateMe");
    //叫出使用者資料
    const user = await User.findOne({
      where: { username: res.locals.username },
      include: EmailTime,
    });
    if (!user) throw new NotFound("找不到該使用者");
    const username = user.username;
    const nickname = req.body.nickname || user.nickname;
    const email = req.body.email || user.email;
    const session = req.body.session || user.session;
    const contact = req.body.contact || user.contact;
    const record = req.body.record || user.record;
    const portrait = req.body.portrait || user.portrait;
    const description = req.body.description || user.description;
    // 檢查漏填
    if (!username || !nickname || !email || !session) throw MissingError;
    // 檢查信箱格式
    if (!emailIsValid(email)) throw new GeneralError("信箱格式錯誤");
    // 檢查屆數格式
    if (!sessionIsValid(session)) throw new GeneralError("屆數格式錯誤");
    // 修改資料
    const updateResult = await User.update(
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
    );
    if (!updateResult[0]) throw new GeneralError("更新失敗");
    return res.status(200).json({
      ok: 1,
      message: "更新成功",
    });
  },

  updatePassword: async (req, res) => {
    console.log("middleware: updatePassword");
    const { oldPassword, newPassword, againPassword } = req.body;
    if (!oldPassword || !newPassword || !againPassword) throw MissingError;
    // 拿到使用者資料
    const user = await User.findOne({
      where: {
        username: res.locals.username,
      },
    });
    if (!user) throw new NotFound("找不到該使用者");
    // 確認 user 的密碼
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) throw VarifyError;
    // 檢查是否相符
    if (newPassword !== againPassword) throw new GeneralError("兩次密碼不一致");
    // 沒有問題，開始 update
    const hashedPassword = await bcrypt
      .hash(newPassword, 10)
      .then((res) => res);
    console.log(hashedPassword);
    const updateResult = await User.update(
      { password: hashedPassword },
      { where: { username: res.locals.username } }
    );
    if (!updateResult[0]) throw new GeneralError("更新失敗");
    return res.status(200).json({
      ok: 1,
      message: "更新成功",
    });
  },

  updateUser: async (req, res) => {
    console.log("middleware: updateUser");
    const id = req.params.username;
    const user = await User.findOne({
      where: { username },
    });
    if (!user) if (!user) throw new NotFound("找不到該使用者");
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
    if (!username || !nickname || !email || !session) throw MissingError;
    // 檢查信箱格式
    if (!emailIsValid(email)) throw new GeneralError("信箱格式錯誤");
    // 檢查屆數格式
    if (!sessionIsValid(session)) throw new GeneralError("屆數格式錯誤");
    // 修改資料
    const updateResult = await User.update(
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
    );
    if (!updateResult[0]) throw new GeneralError("更新失敗");
    return res.status(200).json({
      ok: 1,
      message: "更新成功",
    });
  },

  searchUser: async (req, res) => {
    console.log("middleware: searchUser");
    let { _offset, _limit, _sort, _order, _keyword } = req.query;
    const users = User.findAll({
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
    });
    // 檢查是否為空
    if (users.length === 0) throw new NotFound("符合條件之使用者");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      users,
    });
  },

  updateMyEmailTime: async (req, res) => {
    console.log("middleware: updateMyEmailTime");
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
    const updateResult = await EmailTime.update(
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
    );
    if (!updateResult[0]) throw new GeneralError("更新失敗");
    return res.status(200).json({
      ok: 1,
      message: "更新成功",
    });
  },
};

module.exports = userController;
