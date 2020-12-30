const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middlewares/auth");

userRouter.get("/", checkAuth("isLogin"), userController.getAllUsers);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/logout", checkAuth("isLogin"), userController.login);
userRouter.get("/getMe", checkAuth("isLogin"), userController.getMe);
userRouter.patch("/updateMe", checkAuth("isLogin"), userController.updateMe);
userRouter.patch(
  "/updatePassword",
  checkAuth("isLogin"),
  userController.updatePassword
);

module.exports = userRouter;
