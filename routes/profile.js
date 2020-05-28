const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');
const config = require('config');
const request = require('request');
const { check, validationResult } = require('express-validator');
//@route  /profile/me
//@desc   Get Current User Profile
//access  private
router.get('/me', auth, async (req, res) => {
  //checking for the current User by it's id associated within token
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'No user with that profie' });
    }

    req.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: 'server error' });
  }
});

//@route  /profile/
//@desc   Create or Update User
//access  private

router.post(
  '/',
  [
    auth,
    [
      check('skills', 'skills is required').not().isEmpty(),
      check('status', 'status is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      website,
      skills,
      status,
      bio,
      location,
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
      company,
      githubUserName,
    } = req.body;

    //building profile object

    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (githubUserName) profileFields.githubUserName = githubUserName;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    //build profile social object
    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('internal server error');
    }
  }
);

//@route  /profile/
//@desc   find all user
//access  public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    if (!profiles) {
      return res.status(400).json({ msg: 'No profile founds' });
    }

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//@route  /profile/user/:user_id
//@desc   find by a user id
//access  public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'No profile found' });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'No profile found' });
    }
    res.status(500).send('server error');
  }
});

//@route  Delete /profile/
//@desc   deleta user & profile
//access  private

router.delete('/', auth, async (req, res) => {
  try {
    //@todo delete post

    //delete profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //delete user

    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'user deleted' });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

//@route  Put /profile/exprience
//@desc   Adding exprience
//access  private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, from, to, location, description } = req.body;

    const newExp = {
      title,
      company,
      from,
      to,
      location,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.exprience.push(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    }
  }
);

//@route  Delete /profile/experience/:exp_id
//@desc   delete  experience
//access  private

router.delete('/exprience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.exprience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.exprience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('internal server error');
  }
});

//@route  Put /profile/education
//@desc   Adding education
//access  private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldOfstudy', 'fieldOfstudy is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
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
      fieldOfstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.push(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('internal server error');
    }
  }
);

//@route  Delete /profile/education/:edu_id
//@desc   delete  education
//access  private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('internal server error');
  }
});

//@route  Get /profile/github
//@desc   Get Github User
//access  public

router.get('/github/:username', (req, res) => {
  try {
    const option = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubClientSecret')}`,
      method: 'Get',
      headers: { 'user-agent': 'node.js' },
    };

    request(option, (error, response, body) => {
      if (error) console.log(error);
      if (response.statusCode != 200) {
        return res.status(404).json({ msg: 'No Github User Found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('internal server error');
  }
});

module.exports = router;
