const express = require('express');
const router = express.Router();

const chatController = require('./chat.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth');
const { sendMessageSchema } = require('./chat.validation');

router.use(protect);

router.get('/', chatController.getMyConversations);
router.get('/unread-count', chatController.getUnreadMessagesCount);
router.get('/contacts', chatController.getChatContacts);

router.get('/:partnerId', chatController.getConversation);
router.post(
  '/:partnerId',
  validate(sendMessageSchema),
  chatController.sendMessage
);

module.exports = router;