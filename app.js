const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello Truong!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
