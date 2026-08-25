const express = require('express');
const router = express.Router();

const communityController = require('./community.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth');
const { createPostSchema, addCommentSchema } = require('./community.validation');

router.get('/public-posts', communityController.getPublicFeed);

router.use(protect);

router.post('/posts', validate(createPostSchema), communityController.createPost);
router.get('/posts', communityController.getFeed);
router.get('/posts/:id', communityController.getPost);
router.delete('/posts/:id', communityController.deletePost);

router.post('/posts/:id/like', communityController.toggleLike);

router.post('/posts/:id/comments', validate(addCommentSchema), communityController.addComment);
router.get('/posts/:id/comments', communityController.getComments);
router.delete('/comments/:id', communityController.deleteComment);

module.exports = router;