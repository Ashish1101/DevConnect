const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DevUser',
  },

  website: {
    type: String,
  },

  location: {
    type: String,
  },

  skills: {
    type: [String],
    required: true,
  },

  githubUserName: {
    type: String,
  },

  company: {
    type: String,
  },

  status: {
    type: String,
    required: true,
  },

  bio: {
    tye: String,
  },

  exprience: [
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
      },

      from: {
        type: Date,
        required: true,
      },

      to: {
        type: Date,
      },

      current: {
        type: Boolean,
        default: false,
      },

      description: {
        type: String,
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

      fieldOfstudy: {
        type: String,
        required: true,
      },

      from: {
        type: Date,
        required: true,
      },

      to: {
        type: Date,
      },

      current: {
        type: Boolean,
        default: false,
      },

      description: {
        type: String,
      },
    },
  ],

  social: {
    facebook: {
      type: String,
    },

    twitter: {
      type: String,
    },

    youtube: {
      type: String,
    },

    instagram: {
      type: String,
    },

    linkedin: {
      type: String,
    },
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Profile = mongoose.model('DevUserProfile', ProfileSchema);
