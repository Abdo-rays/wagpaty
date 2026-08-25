const express = require('express');
const router = express.Router();

const reviewController = require('./review.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');
const { createReviewSchema } = require('./review.validation');

router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

router.use(protect);

router.delete('/admin/:id', restrictTo('admin'), reviewController.adminDeleteReview);

router.get('/my-reviews', restrictTo('customer'), reviewController.getMyReviews);
router.get('/can-review/:orderId', restrictTo('customer'), reviewController.canReviewOrder);

router.post(
  '/:orderId',
  restrictTo('customer'),
  validate(createReviewSchema),
  reviewController.createReview
);

router.delete('/:id', restrictTo('customer'), reviewController.deleteMyReview);

module.exports = router;