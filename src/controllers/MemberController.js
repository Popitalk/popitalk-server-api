const router = require("express").Router();
const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const reqPayload = require("../helpers/middleware/reqPayload");
const MemberService = require("../services/ChannelService");
const validators = require("../helpers/validators");
const multer = require("../helpers/middleware/multer");
const { publisher } = require("../config/pubSub");
const {
  USER_CHANNEL_EVENTS,
  USER_EVENTS,
  CHANNEL_EVENTS
} = require("../config/constants");

router.post(
  "/:channelId",
  authenticateUser,
  validators.addMember,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId } = req.payload;
    const memberInfo = await MemberService.addMember({ channelId, userId });
    const { user, type } = memberInfo;
    publisher({
      type: USER_CHANNEL_EVENTS.WS_JOIN_CHANNEL,
      userId,
      channelId,
      initiator: userId,
      payload: { userId, channelId, user, type }
    });
    res.status(201).json({ userId, channelId, user, type });
  })
);

router.delete(
  "/:channelId",
  authenticateUser,
  validators.deleteChannel,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId } = req.payload;
    await MemberService.deleteMember(req.payload);
    publisher({
      type: USER_CHANNEL_EVENTS.WS_LEAVE_CHANNEL,
      userId,
      channelId,
      initiator: userId,
      payload: { channelId, userId }
    });
    res.status(200).json({ channelId, userId });
  })
);

router.post(
  "/:channelId/admins",
  authenticateUser,
  validators.addAdmin,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId: fromUser, adminId: toUser } = req.payload;
    const memberInfo = await MemberService.addAdmin({
      channelId,
      fromUser,
      toUser
    });
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_ADMIN,
      channelId,
      initiator: fromUser,
      payload: { channelId, userId: toUser }
    });
    res.status(200).json({ channelId, ...memberInfo });
  })
);

router.delete(
  "/:channelId/admins/:adminId",
  authenticateUser,
  validators.deleteAdmin,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId: fromUser, adminId: toUser } = req.payload;
    const memberInfo = await MemberService.deleteAdmin({
      channelId,
      fromUser,
      toUser
    });
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_ADMIN,
      channelId,
      initiator: fromUser,
      payload: { channelId, userId: toUser }
    });
    res.status(200).json({ channelId, ...memberInfo });
  })
);

router.post(
  "/:channelId/bans",
  authenticateUser,
  validators.addBan,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId: fromUser, bannedId: toUser } = req.payload;
    const memberInfo = await MemberService.addBan({
      channelId,
      fromUser,
      toUser
    });
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_BAN,
      channelId,
      initiator: fromUser,
      payload: { channelId, userId: toUser }
    });
    res.status(200).json({ channelId, ...memberInfo });
  })
);

router.delete(
  "/:channelId/bans/:adminId",
  authenticateUser,
  validators.deleteBan,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId, userId: fromUser, bannedId: toUser } = req.payload;
    const memberInfo = await MemberService.deleteBan({
      channelId,
      fromUser,
      toUser
    });
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_BAN,
      channelId,
      initiator: fromUser,
      payload: { channelId, userId: toUser }
    });
    res.status(200).json({ channelId, ...memberInfo });
  })
);

module.exports = router;
