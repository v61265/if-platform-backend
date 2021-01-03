const express = require("express");

const app = express();
const port = 3001;
var cors = require("cors");

app.use(cors());

app.listen(port, () => {
  console.log(`hihihi`);
});
