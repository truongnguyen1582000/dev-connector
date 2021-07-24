const express = require('express');
const router = express.Router();
const User = require('../../model/User');
const Post = require('../../model/Post');
const authMiddleware = require('../../middlewares/auth');

const { check, validationResult } = require('express-validator');
const { post } = require('request');

// @route   GET api/posts
// @desc    Get all posts was sorted from latest to oldest
// @access  Public
router.get('/', async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.json(post);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// @route   GET api/posts
// @desc    GET post by id
// @access  Private
router.get('/:post_id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      res.status(400).json({ msg: 'Post not found !' });
    }
    res.status(500).json({ err: err.message });
  }
});

// @route   POST api/posts/
// @desc    add post
// @access   Private
router.post(
  '/',
  [authMiddleware, [check('text', 'Text is required.').notEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ err: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select(
        '-password'
      );

      const { name, avatar } = user;

      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name,
        avatar,
      });

      await newPost.save();
      res.json(newPost);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.delete('/:post_id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found !' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      res.status(404).json({ msg: 'Post not found !' });
    }
    res.status(500).json({ err: err.message });
  }
});

// @route   PUT api/posts/like/:id
// @desc    Update like post by id
// @access  Private
router.put('/like/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      post.likes.filter(
        (like) => like.user.toString() == req.user.id
      ) > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// @route   PUT api/posts/like/:id
// @desc    Unlike post by id
// @access   Private
router.put('/unlike/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      post.likes.filter(
        (like) => like.user.toString() == req.params.id
      ) === 0
    ) {
      return res.status(400).json({ msg: 'Post had not liked' });
    }

    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment the post with post id
// @access   Private
router.post(
  '/comment/:id',
  [authMiddleware, [check('text', 'Text is required').notEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
    }

    try {
      let post = await Post.findById(req.params.id);
      let user = await User.findById(req.user.id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found!' });
      }

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment with post id and commment id
// @access   Private

router.delete(
  '/comment/:id/:comment_id',
  [authMiddleware],
  async (req, res) => {
    try {
      let post = await Post.findById(req.params.id);

      const comment = post.comments.filter(
        (comment) => comment.id === req.params.comment_id
      );

      if (comment.length == 0) {
        return res.status(400).json({ msg: 'Comment not found' });
      }

      post.comments = post.comments.filter(
        (comment) => comment.id !== req.params.comment_id
      );

      post.save();
      res.json(post.comments);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  }
);

module.exports = router;
