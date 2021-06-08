const express = require("express");
var router = express.Router();
const User = require("../../model/User");
const { body, validationResult, check } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("user route");
});

// @route POST api/auth
// @desc  authenticate user and get token for register
// @access Public
router.post(
  "/",
  [
    check("name", "Name is required !").not().isEmpty(),
    check("email", "Please enter an valid email !").isEmail(),
    check("password", "Password must be at least 6 characters.").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ error: [{ msg: "User already exists !" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: 360000,
      });

      res.json({ token });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
