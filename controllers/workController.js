const db = require("../models");
const { Event, Work, User, Tag, Work_Tag } = db;
const sequelize = require("sequelize");
const Op = sequelize.Op;
const {
  GeneralError,
  NotFound,
  MissingError,
} = require("../middlewares/error");

const checkWorkInput = async (input) => {
  const { title, eventId, category, open, anonymous } = input;
  if (!title || !eventId || !category || !open || !anonymous)
    throw MissingError;
  if (!["novel", "poetry", "essay", "other"].includes(category))
    throw new GeneralError("類別格式錯誤");
  if (isNaN(parseInt(eventId))) throw new GeneralError("活動 id 格式錯誤");
  return true;
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
const addTag = async (tag, workId, t) => {
  console.log("start add", tag);
  try {
    // 找到 tagId
    const data = await Tag.findOrCreate({
      where: { content: tag },
      defaults: {
        content: tag,
      },
      transaction: t,
    });
    if (data[1]) console.log("創建 tag");
    // 建立連結
    const result = await Work_Tag.create(
      {
        workId,
        tagId: data[0].id,
      },
      { transaction: t }
    );
    if (!result) throw `tag 創立失敗`;
  } catch (err) {
    throw new Error(`tag 創立失敗: ${err}`);
  }
};

const deleteTag = async (tag, workId, t) => {
  console.log("start delete", tag);
  if (!tag) return;
  try {
    // 找出 tagId
    const tagId = await Tag.findOne({
      where: { content: tag },
    }).then((tag) => tag.id);
    if (!tagId) throw `找不到 tag ${tag}`;
    // 刪除連結
    const result = await Work_Tag.destroy({
      where: { workId, tagId },
      transaction: t,
    });
    if (!result) throw `tag 刪除失敗`;
    // 如果沒有作品有此 tag 則刪除
    const isUsed = await Work_Tag.findAll({
      where: {
        tagId,
      },
    });
    if (isUsed.length) return;
    const deleteResult = await Tag.destroy({
      where: { id: tagId },
      transaction: t,
    });
    if (!deleteResult) throw `tag 刪除失敗`;
  } catch (err) {
    throw new Error(`tag 刪除失敗: ${err}`);
  }
};

const workController = {
  addWork: async (req, res, next) => {
    console.log("start add work");
    await checkWorkInput(req.body).catch(next);
    const { title, eventId, category, open, anonymous, content } = req.body;
    const newTags = [req.body.tag1, req.body.tag2, req.body.tag3];
    const t = await db.sequelize.transaction({ autocommit: false });
    try {
      const result = await Work.create(
        {
          title,
          authorId: res.locals.userId,
          eventId,
          category,
          open,
          anonymous,
          content,
        },
        { transaction: t }
      );
      if (!result) throw "作品創立失敗";
      // 沒問題，傳新的 id 回去
      const lastId = result.id;
      // 新增 tags
      for (tag of newTags) {
        if (tag)
          await addTag(tag, lastId, t).catch((err) => {
            throw err;
          });
      }
      // 修改成功就提交
      await t.commit();
      return res.status(200).json({
        ok: 1,
        id: lastId,
      });
    } catch (err) {
      // 如果失敗就回滾
      await t.rollback();
      throw new GeneralError(err);
    }
  },

  deleteWork: async (req, res) => {
    console.log("start delete work");
    const id = req.params.id;
    const t = await db.sequelize.transaction({ autocommit: false });
    try {
      // 拿 tags 出來並逐個刪掉
      const work = await Work.findOne(
        {
          where: { id },
          include: [{ model: Tag }],
        },
        { transaction: t }
      );
      for (tag of work.Tags) {
        console.log(tag.content);
        await deleteTag(tag.content, id, t).catch((err) => {
          throw err;
        });
      }
      // 刪除文章
      // 前一個 middleware 已經確認過是否有該文章了，因此不用再次確認
      const deleteResult = await Work.update(
        { isDeleted: true },
        { where: { id } },
        { transaction: t }
      );
      if (!deleteResult) throw "作品刪除失敗";
      // 修改成功就提交
      await t.commit();
      return res.status(200).json(okMessage("刪除成功"));
    } catch (err) {
      // 如果失敗就回滾
      await t.rollback();
      throw new GeneralError(err);
    }
  },

  updateWork: async (req, res, next) => {
    console.log("start update work");
    await checkWorkInput(req.body).catch(next);
    const { title, category, open, anonymous, content, eventId } = req.body;
    let newTags = [req.body.tag1, req.body.tag2, req.body.tag3];
    newTags = newTags.filter((tag) => tag != null);
    const id = req.params.id;
    const t = await db.sequelize.transaction({ autocommit: false });
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
        { where: { id, isDeleted: 0 }, transaction: t }
      );
      if (!result) throw "更新失敗";
      // 撈出舊的 tags
      const work = await Work.findOne({
        where: { id },
        include: [{ model: Tag }],
      });
      let oldTags = [];
      work.Tags.map((tag) => oldTags.push(tag.content));
      // 新增 tag
      for (tag of newTags) {
        if (tag && !oldTags.includes(tag)) {
          await addTag(tag, id, t).catch((err) => {
            throw err;
          });
        }
      }
      // 刪除 tag
      for (tag of oldTags) {
        if (!newTags.includes(tag) && tag) {
          await deleteTag(tag.content, id, t).catch((err) => {
            throw err;
          });
        }
      }
      // 修改成功就提交
      await t.commit();
      return res.status(200).json({
        ok: 1,
      });
    } catch (err) {
      // 如果失敗就回滾
      await t.rollback();
      throw new GeneralError(err);
    }
  },

  getWorks: async (req, res) => {
    console.log("start get works");
    const eventId = req.query.eventId || { [Op.ne]: 0 };
    const authorId = req.query.authorId || { [Op.ne]: 0 };
    const selector = getFilterByQuery(req.query, {
      isDeleted: 0,
      authorId,
      eventId,
    });
    // 開始找
    const works = await Work.findAll(selector);
    // 檢查是否為空
    if (works.length === 0) throw new NotFound("目前沒有作品");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      works,
    });
  },

  getWork: async (req, res) => {
    console.log("start get work");
    const selector = getFilterByQuery(req.query, {
      id: req.params.id,
      isDeleted: 0,
    });
    // 開始找
    const work = await Work.findOne(selector);
    // 檢查是否為空
    if (work.length === 0) throw new NotFound("找不到該作品");
    // 沒有問題，顯示資料
    return res.status(200).json({
      ok: 1,
      work,
    });
  },

  searchTags: async (req, res) => {
    console.log("start search tags");
    let { _offset, _limit, _sort, _order, _keyword } = req.query;
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
    if (tags.length === 0) throw new NotFound("目前沒有相關的 tag");
    return res.status(200).json({
      ok: 1,
      tags,
    });
  },
};

module.exports = workController;
