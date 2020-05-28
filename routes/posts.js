const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');

//@route Post /posts/addPost
//desc Add post
//access Private

router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('internal server error');
    }
  }
);

//@route Get /posts/
//@desc Get all posts;
//@access private

router.get('/', auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('internal server error');
  }
});

//@route Get /posts/post
//@desc Get Post By User id
//@access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.json({ msg: 'No Post found' });
    }

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.json({ msg: 'No Post found' });
    }
    res.status(500).send('internal server error');
  }
});

//@route Delete /posts/post/:post_id
//@desc Delete Post by Post id
//@access Private

router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.Post_id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not Found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'user not Authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.json({ msg: 'No Post found' });
    }
    res.status(500).send('internal server error');
  }
});

//@route PUT /post/like/:id
//desc Like a post
//@access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post is already liked

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(404).json({ msg: 'Post already liked' });
    }

    post.likes.push({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).send('internal server error');
  }
});

//@route PUT /post/unlike/:id
//@desc Unlike a post
//@access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post is already liked

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(404).json({ msg: 'Post not yet liked' });
    }

    //if user has liked the post now we have to remove its id from the likes array;

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).send('internal server error');
  }
});

module.exports = router;
