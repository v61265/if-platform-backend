const express = require("express");

const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const session = require("express-session");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");

var cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("dotenv").config();
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/v1/users", userRoutes);
app.use("/v1/events", eventRoutes);
//app.use("/v1/events", workrRoutes);

app.use((err, req, res, next) => {
  console.log("error middleware");
  console.log("err", err);
  return res.status(500).json({ ok: 0, message: err.message });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}!`);
});
