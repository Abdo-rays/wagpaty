const express = require('express');
const router = express.Router();

const restaurantController = require('./restaurant.controller');
const validate = require('../../middlewares/validate');
const { protect, restrictTo } = require('../../middlewares/auth');

const {
  updateProfileSchema,
  changePasswordSchema,
} = require('./restaurant.validation');

router.use(protect, restrictTo('restaurant'));

router.get('/my-profile', restaurantController.getMyProfile);

router.patch('/my-profile',validate(updateProfileSchema),restaurantController.updateMyProfile);

router.patch('/change-password',validate(changePasswordSchema), restaurantController.changeMyPassword);

router.get('/overview', restaurantController.getMyOverview);

module.exports = router;