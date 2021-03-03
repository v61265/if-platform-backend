const db = require("../models");
const { Event, Work, User_Event, User } = db;
const sequelize = require("sequelize");
const Op = sequelize.Op;
const { GeneralError, NotFound, Forbidden } = require("../middlewares/error");

const checkValidTime = (time) => {
  const reg = /^([1-2]\d{3})-(0?[1-9]|1[0-2])-([0-2]?[0-9]|3[0-1])T([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9]).(\d{3})Z$/;
  return reg.test(time);
};

const okMessage = (message) => {
  return {
    ok: 1,
    message,
  };
};

const checkEventInput = (input) => {
  const {
    title,
    presentAttendeesLimit,
    workLimit,
    time,
    openWorksTime,
    location,
  } = input;
  // 檢查漏填
  if (
    !title ||
    !presentAttendeesLimit ||
    !workLimit ||
    !time ||
    !openWorksTime ||
    !location
  ) {
    return "有東西漏填囉";
  }
  // 檢查格式
  if (
    isNaN(parseInt(presentAttendeesLimit)) ||
    isNaN(parseInt(presentAttendeesLimit)) ||
    !checkValidTime(time) ||
    !checkValidTime(openWorksTime)
  ) {
    return "格式不正確";
  }
  return false;
};

const eventController = {
  addEvent: async (req, res) => {
    const check = checkEventInput(req.body);
    if (check) throw new GeneralError(check);
    const {
      title,
      description,
      picture,
      presentAttendeesLimit,
      workLimit,
      time,
      openWorksTime,
      meetingLink,
      referance,
      location,
    } = req.body;
    // 創建活動
    const newEvent = await Event.create({
      title,
      description,
      picture,
      hostId: res.locals.userId,
      presentAttendeesLimit,
      workLimit,
      time,
      openWorksTime,
      location,
      meetingLink,
      referance,
      isDelete: false,
    });
    if (!newEvent) throw new GeneralError("活動創立失敗");
    // 沒問題，傳新的 id 回去
    return res.status(200).json({
      ok: 1,
      id: newEvent.id,
    });
  },

  deleteEvent: async (req, res) => {
    const id = req.params.id;
    // 確認 event 下方有沒有 works
    const event = await Event.findOne({
      where: {
        id,
        isDeleted: 0,
      },
      include: Work,
    });
    if (!event) throw new NotFound("找不到該活動");
    if (event.Works[0]) throw new Forbidden("請先確定底下沒有作品，再刪除活動");
    // 沒問題，來刪除
    await Event.update({ isDeleted: true }, { where: { id } });
    return res.status(200).json(okMessage("刪除成功"));
  },

  getEvents: async (req, res) => {
    let {
      _offset,
      _limit,
      _sort,
      _order,
      _expand_host,
      _expand_participants,
      _expand_works,
      _expand_all,
      status,
    } = req.query;
    // 選擇 expand 哪些項目
    let expand = [];
    if (_expand_all) expand.push({ all: true });
    if (_expand_host) expand.push({ model: User, as: "host" });
    if (_expand_participants) expand.push({ model: User, as: "participant" });
    if (_expand_works) expand.push({ model: Work });
    // 選擇 status
    let time = { [Op.not]: null };
    switch (status) {
      case "history":
        time = { [Op.lt]: new Date() };
        break;
      case "coming":
        time = {
          [Op.gte]: new Date(),
        };
        break;
    }
    // 開始找
    const events = await Event.findAll({
      where: {
        time,
        isDeleted: 0,
      },
      include: expand,
      offset: _offset ? parseInt(_offset) : 0,
      limit: _limit ? parseInt(_limit) : 10,
      order: [[_sort || "createdAt", _order || "DESC"]],
    });
    // 檢查是否為空
    if (!events) throw new NotFound("目前沒有活動");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      events,
    });
  },

  getEvent: async (req, res) => {
    const id = req.params.id;
    const event = await Event.findOne({
      where: {
        id,
        isDeleted: 0,
      },
      include: { all: true },
    });
    // 檢查是否為空
    if (!event) throw new NotFound("找不到該活動");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      event,
    });
  },

  updateEvent: async (req, res) => {
    // 檢查漏填 & 格式
    const check = checkEventInput(req.body);
    if (check) throw new GeneralError(check);
    const id = req.params.id;
    const {
      title,
      description,
      picture,
      presentAttendeesLimit,
      workLimit,
      time,
      openWorksTime,
      location,
      meetingLink,
      referance,
    } = req.body;
    // 修改資料
    const updateResult = await Event.update(
      {
        title,
        description,
        picture,
        presentAttendeesLimit,
        workLimit,
        time,
        openWorksTime,
        location,
        meetingLink,
        referance,
      },
      { where: { id, isDeleted: 0 } }
    );
    if (!updateResult[0]) throw new GeneralError("更新失敗");
    return res.status(200).json(okMessage("更新成功"));
  },

  // 抓單場活動參加者
  getParticipants: async (req, res) => {
    const id = req.params.id;
    const usersList = { present: [], online: [], alternative: [] };
    // 抓到 event 人數限制
    const event = await Event.findOne({
      where: { id },
      attributes: ["presentAttendeesLimit"],
    });
    if (!event) throw new NotFound("找不到該活動");
    const limit = event.presentAttendeesLimit;
    // 抓參加者資訊
    const users = await User_Event.findAll({
      where: { eventId: id },
    });
    // 整理成 usersList 格式
    users.map((user) => {
      switch (user.type) {
        case "online": {
          usersList.online.push(user.userId);
          break;
        }
        case "present": {
          usersList.present.length < limit
            ? usersList.present.push(user.userId)
            : usersList.alternative.push(user.userId);
          break;
        }
      }
    });
    // 回傳資料
    return res.status(200).json({
      ok: 1,
      participants: usersList,
    });
  },

  signUpEvent: async (req, res) => {
    const eventId = req.params.id;
    const userId = res.locals.userId;
    const { type } = req.body;
    // 確認報名類型
    if (type !== "online" && type !== "present")
      throw new GeneralError("請選擇正確報名類型");
    // 確認活動存在
    const event = await Event.findOne({
      where: {
        id: eventId,
        isDeleted: 0,
      },
    });
    if (!event) throw new NotFound("找不到該活動");
    // 確認是否重複報名
    const record = await User_Event.findOne({
      where: { userId, eventId },
    });
    if (record) throw new GeneralError("你已經報名過囉");
    const createResult = awaitUser_Event.create({ userId, eventId, type });
    if (!createResult) throw new GeneralError("報名失敗");
    return res.status(200).json(okMessage("報名成功"));
  },

  cancelSignUpEvent: async (req, res) => {
    const eventId = req.params.id;
    const userId = res.locals.userId;
    // 確認有報名該活動
    const record = await User_Event.findOne({
      where: { userId, eventId },
    });
    if (!record) throw new GeneralError("本來就沒有報名");
    // 移除報名紀錄
    const destoryResult = await User_Event.destroy({
      where: {
        userId,
        eventId,
      },
    });
    if (!destoryResult) throw new GeneralError("取消報名失敗");
    return res.status(200).json(okMessage("取消報名成功"));
  },
};

module.exports = eventController;
