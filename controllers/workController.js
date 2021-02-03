const db = require("../models");
const { Event, Work, User, Tag, Work_Tag } = db;
const sequelize = require("sequelize");
const Op = sequelize.Op;

const checkWorkInput = (input) => {
  const { title, eventId, category, open, anonymous } = input;
  if (!title || !eventId || !category || !open || !anonymous)
    return { ok: 0, message: "有東西漏填囉" };
  if (!["novel", "poetry", "essay", "other"].includes(category))
    return { ok: 0, message: "類別格式不正確" };
  if (isNaN(parseInt(eventId))) return { ok: 0, message: "活動 id 格式不正確" };
  return { ok: 1 };
};

const okMessage = (message) => {
  return {
    ok: 1,
    message,
  };
};

const getFilterByQuery = (queries, condition) => {
  let {
    _offset,
    _limit,
    _sort,
    _order,
    _expand_author,
    _expand_readers,
    _expand_event,
    _expand_tags,
    _expand_all,
  } = queries;
  // 選擇 expand 哪些項目
  let expand = [];
  if (_expand_all) expand.push({ all: true });
  if (_expand_author) expand.push({ model: User, as: "author" });
  if (_expand_readers) expand.push({ model: User, as: "reader" });
  if (_expand_event) expand.push({ model: Event });
  if (_expand_tags) expand.push({ model: Tag });
  return {
    where: condition,
    include: expand,
    offset: _offset ? parseInt(_offset) : 0,
    limit: _limit ? parseInt(_limit) : 10,
    order: [[_sort || "createdAt", _order || "DESC"]],
  };
};

// 新增邏輯：檢查 tag 是否存在，沒有的話就新增，最後建立連結
const addTag = async (tag, workId) => {
  console.log("start add", tag);
  try {
    // 找到 tagId
    const tagId = await Tag.findOrCreate({
      where: { content: tag },
      defaults: {
        content: tag,
      },
    }).then((response) => {
      if (!response) throw "新增 tag 失敗";
      if (response[1]) console.log("創建新 tag");
      return response[0].id;
    });
    // 建立連結
    const result = await Work_Tag.create({
      workId,
      tagId,
    });
    if (!result) throw "新增 tag 失敗";
    return { ok: 1 };
  } catch (err) {
    return { ok: 0, message: err };
  }
};

const deleteTag = async (tag, workId) => {
  try {
    // 找出 tagId
    const tagId = await Tag.findOne({
      where: { content: tag },
    }).then((tag) => tag.id);
    // 刪除連結
    const result = await Work_Tag.destroy({
      where: { workId, tagId },
    });
    if (!result) throw "刪除 tag 失敗";
    // 如果沒有作品有此 tag 則刪除
    const isUsed = await Work_Tag.findAll({
      where: {
        tagId,
      },
    });
    if (isUsed.length) {
      return { ok: 1 };
    }
    const deleteResult = await Tag.destroy({ where: { id: tagId } });
    if (!deleteResult) throw "刪除 tag 失敗";
    return { ok: 1 };
  } catch (err) {
    return { ok: 0, message: err };
  }
};

const workController = {
  addWork: async (req, res, next) => {
    console.log("start add work");
    const check = checkWorkInput(req.body);
    if (!check.ok) return next(new Error(check.message));
    const { title, eventId, category, open, anonymous, content } = req.body;
    const newTags = [req.body.tag1, req.body.tag2, req.body.tag3];
    // 創建活動
    try {
      const result = await Work.create({
        title,
        authorId: res.locals.userId,
        eventId,
        category,
        open,
        anonymous,
        content,
      });
      if (!result) return next(new Error("作品創立失敗"));
      // 沒問題，傳新的 id 回去
      const lastId = result.id;
      // 新增 tags
      newTags.map(async (tag) => {
        const result = await addTag(tag, id);
        if (!result.ok) return next(new Error(result.message));
      });
      return res.status(200).json({
        ok: 1,
        id: lastId,
      });
    } catch (err) {
      next(new Error(err));
    }
  },

  deleteWork: async (req, res, next) => {
    console.log("start delete work");
    const id = req.params.id;
    try {
      // 拿 tags 出來並逐個刪掉
      const work = await Work.findOne({
        where: { id },
        include: [{ model: Tag }],
      });
      work.Tags.map(async (tag) => {
        const result = await deleteTag(tag.content, id);
        if (!result.ok) return next(new Error(result.message));
      });
      // 前一個 middleware 已經確認過是否有該文章了，因此不用再次確認
      const deleteResult = await Work.update(
        { isDeleted: true },
        { where: { id } }
      );
      if (!deleteResult) return next(new Error("刪除失敗"));
      return res.status(200).json(okMessage("刪除成功"));
    } catch (err) {
      next(new Error(err));
    }
  },

  updateWork: async (req, res, next) => {
    console.log("start update work");
    const check = checkWorkInput(req.body);
    if (!check.ok) return next(new Error(check.message));
    const { title, category, open, anonymous, content, eventId } = req.body;
    const newTags = [req.body.tag1, req.body.tag2, req.body.tag3];
    const id = req.params.id;
    try {
      // 修改資料
      const result = await Work.update(
        {
          title,
          category,
          eventId,
          open,
          anonymous,
          content,
        },
        { where: { id, isDeleted: 0 } }
      );
      if (!result) return next(new Error("更新失敗"));
      // 撈出舊的 tags
      const work = await Work.findOne({
        where: { id },
        include: [{ model: Tag }],
      });
      let oldTags = [];
      work.Tags.map((tag) => oldTags.push(tag.content));
      // 新增 tag
      newTags.map(async (tag) => {
        if (!oldTags.includes(tag) && tag) {
          const result = await addTag(tag, id);
          if (!result.ok) return next(new Error(result.message));
        }
      });
      // 刪除 tag
      oldTags.map(async (tag) => {
        if (!newTags.includes(tag) && tag) {
          const result = await deleteTag(tag, id);
          if (!result.ok) return next(new Error(result.message));
        }
      });
      return res.status(200).json({
        ok: 1,
      });
    } catch (err) {
      next(new Error(err));
    }
  },

  getWorks: (req, res, next) => {
    const eventId = req.query.eventId || { [Op.ne]: 0 };
    const authorId = req.query.authorId || { [Op.ne]: 0 };
    const selector = getFilterByQuery(req.query, {
      isDeleted: 0,
      authorId,
      eventId,
    });
    // 開始找
    Work.findAll(selector)
      .then((works) => {
        // 檢查是否為空
        if (works.length === 0) return next(new Error("目前沒有作品喔"));
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          works,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  getWork: (req, res, next) => {
    const selector = getFilterByQuery(req.query, {
      id: req.params.id,
      isDeleted: 0,
    });
    // 開始找
    Work.findOne(selector)
      .then((works) => {
        // 檢查是否為空
        if (works.length === 0) return next(new Error("目前沒有作品喔"));
        // 沒有問題，顯示資料
        return res.status(200).json({
          ok: 1,
          works,
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  },

  searchTags: async (req, res, next) => {
    let { _offset, _limit, _sort, _order, _keyword } = req.query;
    try {
      const tags = await Tag.findAll({
        where: {
          [Op.or]: {
            content: { [Op.regexp]: `[${_keyword}]` },
          },
        },
        offset: _offset ? parseInt(_offset) : 0,
        limit: _limit ? parseInt(_limit) : 10,
        order: [[_sort || "createdAt", _order || "DESC"]],
      });
      return res.status(200).json({
        ok: 1,
        tags,
      });
    } catch (err) {
      next(new Error(err));
    }
  },
};

module.exports = workController;
