const express = require("express");

const app = express();
const port = process.env.PORT || 3001;
const bodyParser = require("body-parser");
const session = require("express-session");
const { handleError } = require("./middlewares/error");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const workRoutes = require("./routes/workRoutes");

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
app.use("/v1/works", workRoutes);

app.use(handleError);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}!`);
});
