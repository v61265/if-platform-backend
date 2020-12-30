const express = require("express");

const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const session = require("express-session");
const userRoutes = require("./routes/userRoutes");

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}!`);
});

app.use("/v1/users", userRoutes);
//app.use("/v1/users", eventRoutes);
//app.use("/v1/events", workrRoutes);
