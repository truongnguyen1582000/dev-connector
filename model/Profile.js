const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // forein key of user.id
      ref: 'user',
    },
    company: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    bio: {
      type: String,
    },
    githubusername: {
      type: String,
    },
    experiance: [
      {
        title: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          default: null,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          default: null,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          default: null,
        },
      },
    ],
    education: [
      {
        school: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        fieldofstudy: {
          type: String,
          required: true,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          default: null,
        },
        current: {
          type: Boolean,
          default: false,
          default: null,
        },
        description: {
          type: String,
          default: null,
        },
      },
    ],
    social: {
      youtube: {
        type: String,
      },
      facebook: {
        type: String,
      },
      twitter: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model('profile', ProfileSchema);
module.exports = Profile;
