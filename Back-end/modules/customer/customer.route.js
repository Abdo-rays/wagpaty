const express = require('express');
const router = express.Router();

const customerController = require('./customer.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');

const {
  updateProfileSchema,
  changePasswordSchema,
} = require('./customer.validation');

// Public discovery endpoints must remain available before authentication.
router.get('/restaurants', customerController.getAvailableRestaurants);
router.get('/restaurants/:id', customerController.getRestaurantDetails);
router.get('/public-stats', customerController.getPublicStats);

router.use(protect, restrictTo('customer'));

router.get('/my-profile', customerController.getMyProfile);

router.patch(
  '/my-profile',
  validate(updateProfileSchema),
  customerController.updateMyProfile
);

router.patch(
  '/change-password',
  validate(changePasswordSchema),
  customerController.changeMyPassword
);

router.get('/overview', customerController.getMyOverview);

module.exports = router;