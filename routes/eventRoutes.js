const express = require("express");
const eventRouter = express.Router();
const eventController = require("../controllers/eventController");
const { checkAuth } = require("../middlewares/auth");
const { catchAsyncError } = require("../middlewares/error");

// 活動本身相關
eventRouter.post(
  "/add",
  catchAsyncError(checkAuth("isAdmin")),
  catchAsyncError(eventController.addEvent)
);
eventRouter.get(
  "/delete/:id",
  catchAsyncError(checkAuth("isAdmin")),
  catchAsyncError(eventController.deleteEvent)
);
eventRouter.get(
  "/",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(eventController.getEvents)
);
eventRouter.get(
  "/:id",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(eventController.getEvent)
);
eventRouter.patch(
  "/:id",
  catchAsyncError(checkAuth("isAdmin")),
  catchAsyncError(eventController.updateEvent)
);

// 使用者參加活動相關
eventRouter.get(
  "/participants/:id",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(eventController.getParticipants)
);
eventRouter.post(
  "/sign-up/:id",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(eventController.signUpEvent)
);
eventRouter.get(
  "/cancel-sign-up/:id",
  catchAsyncError(checkAuth("isLogin")),
  catchAsyncError(eventController.cancelSignUpEvent)
);

module.exports = eventRouter;
