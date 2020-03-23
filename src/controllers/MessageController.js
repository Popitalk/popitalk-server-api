const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const reqPayload = require("../helpers/middleware/reqPayload");
const MessageService = require("../services/MessageService");
const validators = require("../helpers/validators");
const { publisher } = require("../config/pubSub");
const { CHANNEL_EVENTS } = require("../config/constants");

router.post(
  "/",
  authenticateUser,
  validators.addMessage,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const newMessage = await MessageService.addMessage(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_MESSAGE,
      channelId,
      initiator: userId,
      payload: {
        userId,
        channelId,
        message: newMessage
      }
    });
    res.status(201).json(newMessage);
  })
);

router.get(
  "/:channelId",
  authenticateUser,
  validators.getMessages,
  reqPayload,
  asyncHandler(async (req, res) => {
    const messages = await MessageService.getMessages(req.payload);
    res.json(messages);
  })
);

router.delete(
  "/:messageId",
  authenticateUser,
  validators.deleteMessage,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const deletedMessage = await MessageService.deleteMessage(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_MESSAGE,
      channelId,
      initiator: userId,
      payload: {
        userId,
        channelId,
        ...deletedMessage
      }
    });
    res.status(201).json(deletedMessage);
  })
);

module.exports = router;
