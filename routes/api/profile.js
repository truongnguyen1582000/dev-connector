const express = require("express");
var router = express.Router();
const authMiddleware = require("../../middlewares/auth");
const Profile = require("../../model/Profile");
const { check, validationResult } = require("express-validator");

// @route   GET api/profile/me
// @desc    get current user profile
// @access   Public
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      res.status(400).json({ msg: "User haven't profile" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).send("server error");
  }
});

// @route   GET api/profile/
// @desc    get all profile
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).status("server error");
  }
});

// @route   GET api/profile/
// @desc    get profile with user id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const profiles = await Profile.findOne({ user: req.params.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profiles) {
      res.status(400).json({ msg: "No profille for this user." });
    }

    res.json(profiles);
  } catch (err) {
    if (err.kind == "ObjectId") {
      res.status(400).json({ msg: "Profile not found !" });
    }
    res.status(500).status("server error");
  }
});

// @route   GET api/profile/
// @desc    create or update user profile
// @access   Private
router.post(
  "/",
  [
    authMiddleware,
    [
      check("status", "Status is required !").notEmpty(),
      check("skills", "Skills is required !").notEmpty(),
    ],
  ],
  async (req, res) => {
    // validate data from user
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
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

        console.log(profile);

        res.json(profile);
      }

      //Create
      profile = new Profile(profileField);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
