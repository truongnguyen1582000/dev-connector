const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth');
const User = require('../../model/User');
const { validationResult, check } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// get user with jwt has encoded (req.user = decode.user)
// return an user match with token has provide
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).send('server error!');
  }
});

// @route POST /auth
// @desc  authenticate user and get token for login
// @access Public
router.post(
  '/',
  [
    check('email', 'Please enter an valid email !').isEmail(),
    check('password', 'Please enter password !').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          error: [{ msg: 'Email or password is incorrect !' }],
        });
      }

      // compare password in db with password user provide
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          error: [{ msg: 'Email or password is incorrect !' }],
        });
      }

      // payload need to create jwt
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
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
