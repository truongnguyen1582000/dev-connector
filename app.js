const express = require("express");
const connectDB = require("./config/connectDB");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// permit to read req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Truong!");
});

// ROUTE
app.use("/posts", require("./routes/api/posts"));
app.use("/auth", require("./routes/api/auth"));
app.use("/profile", require("./routes/api/profile"));
app.use("/users", require("./routes/api/users"));
app.use("/test", require("./routes/api/test"));

// CONNECT TO DB
connectDB();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
