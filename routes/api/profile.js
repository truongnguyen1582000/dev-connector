const express = require('express');
var router = express.Router();
const request = require('request');
const authMiddleware = require('../../middlewares/auth');
const Profile = require('../../model/Profile');
const { check, validationResult } = require('express-validator');

// @route   GET api/profile/me
// @desc    get current user profile
// @access  Public
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: "User haven't profile" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// @route   GET api/profile/
// @desc    get all profile
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'name',
      'avatar',
    ]);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ err: error.message });
  }
});

// @route   GET api/profile/
// @desc    get profile with user id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const profiles = await Profile.findOne({
      user: req.params.id,
    }).populate('user', ['name', 'avatar']);

    if (!profiles) {
      return res
        .status(400)
        .json({ msg: 'No profille for this user.' });
    }

    res.json(profiles);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      res.status(400).json({ msg: 'Profile not found !' });
    }
    res.status(500).json({ err: error.message });
  }
});

// @route   GET api/profile/
// @desc    create or update user profile
// @access   Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('status', 'Status is required !').notEmpty(),
      check('skills', 'Skills is required !').notEmpty(),
    ],
  ],
  async (req, res) => {
    // validate data from user
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // take out all value form value had submited
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      education,
      experience,
      social,
    } = req.body;

    //build profile object
    let profileField = {
      user: req.user.id,
      company: company ? company : null,
      website: website ? website : null,
      location: location ? location : null,
      bio: bio ? bio : null,
      status: status,
      githubusername: githubusername ? githubusername : null,
      skills: skills,
      social: social,
      experience: experience,
      education: education,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileField },
          { new: true }
        );

        return res.json(profile);
      }

      //Create
      profile = new Profile(profileField);
      await profile.save();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  }
);

// @route   DELETE api/profile/
// @desc    delete user profile
// @access   Private
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: "User haven't profile" });
    }

    await Profile.deleteOne({ user: req.user.id });
    res.json({ msg: 'Delete profile complete' });
  } catch (err) {
    res.status(500).json({ err: error.message });
  }
});

// @route   PUT api/profile/experience
// @desc    updaate user profile experience
// @access   Private
router.put(
  '/experience',
  [
    authMiddleware,
    [
      check('title', 'Title is required.').notEmpty(),
      check('company', 'Company is required.').notEmpty(),
      check('from', 'From date is required.').notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile.experiance.unshift(newExp);
      await profile.save();
      res.send(profile);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   DELETE api/profile/experience
// @desc    remove user profile experience by id
// @access   Private
router.delete(
  '/experience/:exp_id',
  authMiddleware,
  async (req, res) => {
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      profile.experiance = profile.experiance.filter(
        (experiance) => experiance.id !== req.params.exp_id
      );

      await profile.save();

      res.json(profile);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        res.status(404).json({ msg: 'Profile not found !' });
      }
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   PUT api/profile/education
// @desc    update user profile education
// @access   Private
router.put(
  '/education',
  [
    authMiddleware,
    [
      check('school', 'School is required.').notEmpty(),
      check('degree', 'Degree is required.').notEmpty(),
      check('fieldofstudy', 'Field of study is required.').notEmpty(),
      check('from', 'From is required.').notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.send(profile);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   DELETE api/profile/education
// @desc    remove user profile education by id
// @access   Private
router.delete(
  '/education/:edu_id',
  authMiddleware,
  async (req, res) => {
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      profile.education = profile.education.filter(
        (edu) => edu.id !== req.params.edu_id
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   GET api/profile/github:username
// @desc    get user repos from github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const option = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(option, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: 'no github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
