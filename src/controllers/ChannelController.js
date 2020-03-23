const router = require("express").Router();
const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const reqPayload = require("../helpers/middleware/reqPayload");
const ChannelService = require("../services/ChannelService");
const validators = require("../helpers/validators");
const multer = require("../helpers/middleware/multer");
const { publisher } = require("../config/pubSub");
const {
  USER_CHANNEL_EVENTS,
  USER_EVENTS,
  CHANNEL_EVENTS
} = require("../config/constants");

router.post(
  "/",
  authenticateUser,
  multer.single("icon"),
  validators.addChannel,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const icon = req.file;
    const newChannel = await ChannelService.addChannel({
      ...req.payload,
      icon
    });
    publisher({
      type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      channelId: newChannel.id,
      userId,
      payload: { userId, channelId: newChannel.id, type: "channel" }
    });
    res.status(201).json({ channelId: newChannel.id, channel: newChannel });
  })
);

router.get(
  "/:channelId",
  authenticateUser,
  validators.getChannel,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const channelInfo = await ChannelService.getChannel(req.payload);
    publisher({
      type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      channelId,
      userId,
      payload: { userId, channelId, type: "channel" }
    });
    res.json({ channelId, ...channelInfo });
  })
);

router.put(
  "/:channelId",
  authenticateUser,
  multer.single("icon"),
  validators.updateChannel,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const icon = req.file;
    const updatedChannel = await ChannelService.updateChannel({
      ...req.payload,
      icon
    });
    publisher({
      type: CHANNEL_EVENTS.WS_UPDATE_CHANNEL,
      channelId,
      initiator: userId,
      payload: { userId, channelId, updatedChannel }
    });
    res.status(200).json({ channelId, updatedChannel });
  })
);

router.delete(
  "/:channelId",
  authenticateUser,
  validators.updateUser,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    await ChannelService.deleteChannel(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_CHANNEL,
      channelId,
      initiator: userId,
      payload: { channelId }
    });
    res.status(200).json({ channelId });
  })
);

module.exports = router;
