const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
//@route  /users/

router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'Email should be Unique').isEmail(),
    check(
      'password',
      'Password length should be 6 character or long'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(404)
          .json({ errors: [{ msg: 'Email already exsits' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        email,
        name,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);

      const hash = await bcrypt.hash(password, salt);

      user.password = hash;

      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //return webtoken
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);

module.exports = router;
