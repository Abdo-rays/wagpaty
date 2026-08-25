const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');

const getAuthorModel = (role) => (role === 'restaurant' ? 'Restaurant' : 'User');

const checkNotBanned = (req, next) => {
  if (req.user.isBanned) {
    next(new ApiError('تم حظرك من التفاعل في الكوميونيتي، تواصل مع الإدارة لمزيد من التفاصيل', 403));
    return false;
  }
  return true;
};

exports.getPublicFeed = catchAsync(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 6, 20);
  const posts = await Post.find()
    .populate('author', 'name restaurantName profileImage logo code')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({ status: 'success', results: posts.length, data: posts });
});

exports.createPost = catchAsync(async (req, res, next) => {
  if (!checkNotBanned(req, next)) return;

  const { image, caption } = req.body;

  const post = await Post.create({
    author: req.user._id,
    authorModel: getAuthorModel(req.user.role),
    image,
    caption,
  });

  res.status(201).json({ status: 'success', message: 'تم نشر المنشور بنجاح', data: post });
});

exports.getFeed = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate('author', 'name restaurantName profileImage logo code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postIds = posts.map((p) => p._id);
  const myLikes = await Like.find({ post: { $in: postIds }, user: req.user._id }).select('post');
  const likedPostIds = new Set(myLikes.map((l) => l.post.toString()));

  const postsWithLikeFlag = posts.map((post) => ({
    ...post.toObject(),
    isLikedByMe: likedPostIds.has(post._id.toString()),
  }));

  res.status(200).json({ status: 'success', page, results: postsWithLikeFlag.length, data: postsWithLikeFlag });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('author', 'name restaurantName profileImage logo code');
  if (!post) {
    return next(new ApiError('المنشور غير موجود', 404));
  }
  res.status(200).json({ status: 'success', data: post });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError('المنشور غير موجود', 404));
  }

  const isOwner = post.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return next(new ApiError('غير مصرح لك بحذف هذا المنشور', 403));
  }

  await Post.findByIdAndDelete(req.params.id);
  await Like.deleteMany({ post: req.params.id });
  await Comment.deleteMany({ post: req.params.id });

  res.status(200).json({ status: 'success', message: 'تم حذف المنشور بنجاح' });
});

exports.toggleLike = catchAsync(async (req, res, next) => {
  if (!checkNotBanned(req, next)) return;

  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError('المنشور غير موجود', 404));
  }

  const existingLike = await Like.findOne({ post: req.params.id, user: req.user._id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    return res.status(200).json({ status: 'success', message: 'تم إلغاء الإعجاب', liked: false, likesCount: post.likesCount });
  }

  await Like.create({ post: req.params.id, user: req.user._id, userModel: getAuthorModel(req.user.role) });
  post.likesCount += 1;
  await post.save();

  res.status(200).json({ status: 'success', message: 'تم الإعجاب بالمنشور', liked: true, likesCount: post.likesCount });
});

exports.addComment = catchAsync(async (req, res, next) => {
  if (!checkNotBanned(req, next)) return;

  const { content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError('المنشور غير موجود', 404));
  }

  const comment = await Comment.create({
    post: req.params.id,
    author: req.user._id,
    authorModel: getAuthorModel(req.user.role),
    content,
  });

  post.commentsCount += 1;
  await post.save();

  res.status(201).json({ status: 'success', data: comment });
});

exports.getComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate('author', 'name restaurantName profileImage logo')
    .sort({ createdAt: 1 });

  res.status(200).json({ status: 'success', results: comments.length, data: comments });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ApiError('التعليق غير موجود', 404));
  }

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return next(new ApiError('غير مصرح لك بحذف هذا التعليق', 403));
  }

  await Comment.findByIdAndDelete(req.params.id);
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  res.status(200).json({ status: 'success', message: 'تم حذف التعليق بنجاح' });
});