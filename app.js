const express = require("express");
const connectDB = require("./config/connectDB");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello Truong!");
});

// CONNECT TO DB
connectDB();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
