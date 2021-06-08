const express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.send("profile route");
});

module.exports = router;
