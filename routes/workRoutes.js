const express = require("express");
const workRouter = express.Router();
const workController = require("../controllers/workController");
const { checkAuth } = require("../middlewares/auth");

// 作品本身
workRouter.get("/", checkAuth("isLogin"), workController.getWorks);
workRouter.get(
  "/:id",
  checkAuth("isLogin"),
  checkAuth("isReader"),
  workController.getWork
);
workRouter.post("/add", checkAuth("isLogin"), workController.addWork);
workRouter.get("/delete/:id", checkAuth("isAuthor"), workController.deleteWork);
workRouter.patch("/:id", checkAuth("isAuthor"), workController.updateWork);

// 閱讀權限和紀錄

// tags 相關
workRouter.get("/tags/search", checkAuth("isLogin"), workController.searchTags);

module.exports = workRouter;
