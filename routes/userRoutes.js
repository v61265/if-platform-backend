const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middlewares/auth");
const { catchAsyncError } = require("../middlewares/error");

userRouter.get(
  "/",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.getAllUsers)
);
userRouter.post("/register", catchAsyncError(userController.register));
userRouter.post("/login", catchAsyncError(userController.login));
userRouter.get(
  "/me",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.getUser)
);
userRouter.patch(
  "/me",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.updateMe)
);
userRouter.patch(
  "/myEmailTime",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.updateMyEmailTime)
);
userRouter.patch(
  "/updatePassword",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.updatePassword)
);
userRouter.get(
  "/search",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.searchUser)
);
userRouter.get(
  "/:username",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(userController.getUser)
);
userRouter.patch(
  "/:username",
  catchAsyncError(checkAuth("isAdmin")),
  catchAsyncError(userController.updateUser)
);

module.exports = userRouter;
