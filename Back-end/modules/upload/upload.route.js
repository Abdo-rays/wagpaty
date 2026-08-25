const express = require('express');
const router = express.Router();

const uploadController = require('./upload.controller');
const upload = require('../../middlewares/upload');
const { protect } = require('../../middlewares/auth');

router.post('/image', protect, upload.single('image'), uploadController.uploadImage);

module.exports = router;