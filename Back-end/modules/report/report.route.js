const express = require('express');
const router = express.Router();

const reportController = require('./report.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');
const { createReportSchema, reviewReportSchema } = require('./report.validation');

router.use(protect);

router.get('/admin', restrictTo('admin'), reportController.getAllReports);
router.patch('/admin/:id', restrictTo('admin'), validate(reviewReportSchema), reportController.updateReportStatus);
router.delete('/admin/:id', restrictTo('admin'), reportController.deleteReport);

router.get('/my-reports', reportController.getMyReports);
router.post('/', validate(createReportSchema), reportController.createReport);

module.exports = router;