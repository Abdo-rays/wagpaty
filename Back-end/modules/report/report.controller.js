const Report = require('../../models/Report');
const Restaurant = require('../../models/Restaurant');
const Meal = require('../../models/Meal');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');

const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/apiError');

const targetModelMap = {
  restaurant: { Model: Restaurant, modelName: 'Restaurant' },
  meal: { Model: Meal, modelName: 'Meal' },
  post: { Model: Post, modelName: 'Post' },
};

exports.createReport = catchAsync(async (req, res, next) => {
  const { targetType, targetId, reason } = req.body;
  const { Model, modelName } = targetModelMap[targetType];

  const target = await Model.findById(targetId);
  if (!target) {
    return next(new ApiError('المحتوى المُبلَّغ عنه غير موجود', 404));
  }

  const report = await Report.create({
    reporter: req.user._id,
    reporterModel: req.user.role === 'restaurant' ? 'Restaurant' : 'User',
    targetType,
    target: targetId,
    targetModel: modelName,
    reason,
  });

  res.status(201).json({
    status: 'success',
    message: 'تم إرسال بلاغك بنجاح، سيتم مراجعته من الإدارة',
    data: report,
  });
});

exports.getMyReports = catchAsync(async (req, res, next) => {
  const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: reports.length, data: reports });
});

exports.getAllReports = catchAsync(async (req, res, next) => {
  const { status, targetType } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (targetType) filter.targetType = targetType;

  const reports = await Report.find(filter)
    .populate('reporter', 'name restaurantName email code profileImage logo')
    .populate('target')
    .sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', results: reports.length, data: reports });
});

exports.updateReportStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(new ApiError('البلاغ غير موجود', 404));
  }

  report.status = status;
  await report.save();

  res.status(200).json({ status: 'success', message: 'تم تحديث حالة البلاغ', data: report });
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(new ApiError('البلاغ غير موجود', 404));
  }

  if (report.targetType === 'post') {
    await Post.findByIdAndDelete(report.target);
    await Like.deleteMany({ post: report.target });
    await Comment.deleteMany({ post: report.target });
    await Report.deleteMany({ targetType: 'post', target: report.target });
    return res.status(200).json({ status: 'success', message: 'تم حذف البلاغ والمنشور بنجاح' });
  }

  await Report.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'تم حذف البلاغ' });
});
