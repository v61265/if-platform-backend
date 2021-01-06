const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middlewares/auth");

userRouter.get("/", checkAuth("isLogin"), userController.getAllUsers);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.get("/me", checkAuth("isLogin"), userController.getUser);
userRouter.patch("/me", checkAuth("isLogin"), userController.updateMe);
userRouter.patch(
  "/updatePassword",
  checkAuth("isLogin"),
  userController.updatePassword
);
userRouter.get("/:id", checkAuth("isLogin"), userController.getUser);
userRouter.patch("/:id", checkAuth("isAdmin"), userController.updateUser);

module.exports = userRouter;
