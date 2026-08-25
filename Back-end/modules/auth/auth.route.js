const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const {
  customerSignupSchema,
  restaurantSignupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} = require('./auth.validation');


router.post('/customer/signup',validate(customerSignupSchema),authController.signupCustomer);
router.post('/restaurant/signup',validate(restaurantSignupSchema),authController.signupRestaurant);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOTP);
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOTP);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forget-password',validate(forgetPasswordSchema),authController.forgetPassword);
router.post('/reset-password',validate(resetPasswordSchema),authController.resetPassword);

module.exports = router;