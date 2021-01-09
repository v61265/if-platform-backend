const db = require("../models");
const { Event, Work, User_Event, User } = db;

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
  addEvent: async (req, res, next) => {
    const check = checkEventInput(req.body);
    if (check) return next(new Error(check));
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
    try {
      const result = await Event.create({
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
      if (!result) return next(new Error("活動建立失敗"));
      // 沒問題，傳新的 id 回去
      const lastEvent = await Event.findOne({ order: [["id", "DESC"]] });
      return res.status(200).json({
        ok: 1,
        id: lastEvent.id,
      });
    } catch (err) {
      next(new Error(err));
    }
  },

  deleteEvent: async (req, res, next) => {
    const id = req.params.id;
    // 確認 event 下方有沒有 works
    let event;
    try {
      event = await Event.findOne({
        where: {
          id,
          isDeleted: 0,
        },
        include: Work,
      });
      if (!event) next(new Error("找不到該活動"));
      if (event.Works[0]) next(new Error("請先確定底下沒有作品，再刪除活動"));
      // 沒問題，來刪除
      Event.update({ isDeleted: true }, { where: { id } }).then(() => {
        return res.status(200).json(okMessage("刪除成功"));
      });
    } catch (err) {
      next(new Error(err));
    }
  },

  getEvents: (req, res, next) => {
    let {
      _offset,
      _limit,
      _sort,
      _order,
      _expand_host,
      _expand_participants,
      _expand_works,
      _expand_all,
    } = req.query;
    // 選擇 expand 哪些項目
    let expand = [];
    if (_expand_all) expand.push({ all: true });
    if (_expand_host) expand.push({ model: User, as: "host" });
    if (_expand_participants) expand.push({ model: User, as: "participant" });
    if (_expand_works) expand.push({ model: Work });
    // 開始找
    Event.findAll({
      where: {
        isDeleted: 0,
      },
      include: expand,
      offset: _offset ? parseInt(_offset) : 0,
      limit: _limit ? parseInt(_limit) : 10,
      order: [[_sort || "createdAt", _order || "DESC"]],
    })
      .then((events) => {
        // 檢查是否為空
        if (events.length === 0) return next(new Error("目前沒有活動喔"));
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          events,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  getEvent: (req, res, next) => {
    const id = req.params.id;
    Event.findOne({
      where: {
        id,
        isDeleted: 0,
      },
      include: { all: true },
    })
      .then((event) => {
        // 檢查是否為空
        if (!event) return next(new Error("找不到該活動喔"));
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          event,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  updateEvent: (req, res, next) => {
    // 檢查漏填 & 格式
    const check = checkEventInput(req.body);
    if (check) return next(new Error(check));
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
    Event.update(
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
    )
      .then((event) => {
        if (!event[0]) return next(new Error("找不到該活動"));
        return res.status(200).json(okMessage("更新成功"));
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  // 抓單場活動參加者
  getParticipants: async (req, res, next) => {
    const id = req.params.id;
    const usersList = { present: [], online: [], alternative: [] };
    try {
      // 先抓到 event 人數限制
      const limit = await Event.findOne({
        where: { id },
        attributes: ["presentAttendeesLimit"],
      }).then((data) => data.presentAttendeesLimit);
      if (!limit) return next(new Error("該活動不存在喔"));
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
    } catch (err) {
      next(new Error(err));
    }
  },

  signUpEvent: async (req, res, next) => {
    console.log(okMessage);
    const eventId = req.params.id;
    const userId = res.locals.userId;
    const { type } = req.body;
    // 確認報名類型
    if (type !== "online" && type !== "present")
      return next(new Error("請選擇正確報名類型"));
    try {
      // 確認活動存在
      const event = await Event.findOne({
        where: {
          id: eventId,
          isDeleted: 0,
        },
      });
      if (!event) return next(new Error("該活動不存在喔"));
      // 確認是否重複報名
      const record = await User_Event.findOne({
        where: { userId, eventId },
      });
      if (record) return next(new Error("你已經報名過該活動囉"));
      User_Event.create({ userId, eventId, type }).then((result) => {
        if (!result) {
          return next(new Error("報名失敗，請再試一次"));
        }
        return res.status(200).json(okMessage("報名成功"));
      });
    } catch (err) {
      next(new Error(err));
    }
  },

  cancelSignUpEvent: async (req, res, next) => {
    const eventId = req.params.id;
    const userId = res.locals.userId;
    try {
      // 確認有報名該活動
      const record = await User_Event.findOne({
        where: { userId, eventId },
      });
      if (!record) return next(new Error("你本來就沒有報名喔"));
      // 移除報名紀錄
      User_Event.destroy({
        where: {
          userId,
          eventId,
        },
      }).then((result) => {
        if (!result) {
          return next(new Error("取消失敗，請再試一次"));
        }
        return res.status(200).json(okMessage("取消報名成功"));
      });
    } catch (err) {
      next(new Error(err));
    }
  },
};

module.exports = eventController;
