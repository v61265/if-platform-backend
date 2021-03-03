const express = require("express");
const workRouter = express.Router();
const workController = require("../controllers/workController");
const { checkAuth } = require("../middlewares/auth");
const { catchAsyncError } = require("../middlewares/error");

// 作品本身
workRouter.get(
  "/",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(workController.getWorks)
);
workRouter.get(
  "/:id",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(checkAuth("isReader")),
  catchAsyncError(workController.getWork)
);
workRouter.post(
  "/add",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(workController.addWork)
);
workRouter.get(
  "/delete/:id",
  catchAsyncError(checkAuth("isAuthor")),
  catchAsyncError(workController.deleteWork)
);
workRouter.patch(
  "/:id",
  catchAsyncError(checkAuth("isAuthor")),
  catchAsyncError(workController.updateWork)
);

// 閱讀權限和紀錄

// tags 相關
workRouter.get(
  "/tags/search",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(workController.searchTags)
);

module.exports = workRouter;
