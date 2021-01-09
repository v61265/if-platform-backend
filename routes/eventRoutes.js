const express = require("express");
const eventRouter = express.Router();
const eventController = require("../controllers/eventController");
const { checkAuth } = require("../middlewares/auth");

// 活動本身相關
eventRouter.post("/add", checkAuth("isAdmin"), eventController.addEvent);
eventRouter.get(
  "/delete/:id",
  checkAuth("isAdmin"),
  eventController.deleteEvent
);
eventRouter.get("/", checkAuth("isLogin"), eventController.getEvents);
eventRouter.get("/:id", checkAuth("isLogin"), eventController.getEvent);
eventRouter.patch("/:id", checkAuth("isAdmin"), eventController.updateEvent);

// 使用者參加活動相關
eventRouter.get(
  "/participants/:id",
  checkAuth("isLogin"),
  eventController.getParticipants
);
eventRouter.post(
  "/sign-up/:id",
  checkAuth("isLogin"),
  eventController.signUpEvent
);
eventRouter.get(
  "/cancel-sign-up/:id",
  checkAuth("isLogin"),
  eventController.cancelSignUpEvent
);

module.exports = eventRouter;
