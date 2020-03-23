const router = require("express").Router();
const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");
const reqPayload = require("../helpers/middleware/reqPayload");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const UserService = require("../services/UserService");
const validators = require("../helpers/validators");
const multer = require("../helpers/middleware/multer");
const { publisher } = require("../config/pubSub");
const { USER_CHANNEL_EVENTS, USER_EVENTS } = require("../config/constants");

router.post(
  "/",
  validators.addUser,
  reqPayload,
  asyncHandler(async (req, res) => {
    const newUser = await UserService.addUser(req.body);
    res.status(201).json(newUser);
  })
);

router.get(
  "/:userId",
  authenticateUser,
  validators.getUser,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const user = await UserService.getUser(req.payload);
    res.json({
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar
    });
  })
);

router.put(
  "/",
  authenticateUser,
  multer.single("avatar"),
  validators.updateUser,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { password, removeAvatar } = req.payload;
    const avatar = req.file;

    if (avatar && !password) throw Boom.badRequest("Didn't provide password");
    if (avatar && removeAvatar)
      throw Boom.badRequest("Either avatar must be provided or removeAvatar");

    const updatedUser = await UserService.updateUser({
      ...req.payload,
      avatar
    });
    res.status(200).json(updatedUser);
  })
);

router.delete(
  "/",
  authenticateUser,
  reqPayload,
  asyncHandler(async (req, res) => {
    await UserService.deleteUser(req.payload);
    req.logout();
    res.status(204).json({});
  })
);

router.get(
  "/",
  authenticateUser,
  validators.searchUsers,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { username } = req.query;
    const users = await UserService.searchUsers({ username });
    res.json(users);
  })
);

// resource doesn't exist yet, so remove requestee in url
router.post(
  "/friendRequests",
  authenticateUser,
  validators.sendFriendRequest,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: fromUser, requesteeId: toUser } = req.payload;
    const user = await UserService.addFriendRequest({ fromUser, toUser });
    publisher({
      type: USER_EVENTS.WS_ADD_RECEIVED_FRIEND_REQUEST,
      userId: toUser,
      payload: { userId: fromUser, user }
    });
    res.status(201).json({ userId: fromUser, user });
  })
);

router.delete(
  "/friendRequests/:requesteeId/cancel",
  authenticateUser,
  validators.cancelFriendRequest,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: fromUser, requesteeId: toUser } = req.payload;
    await UserService.deleteFriendRequest({
      userId1: fromUser,
      userId2: toUser
    });
    publisher({
      type: USER_EVENTS.WS_DELETE_RECEIVED_FRIEND_REQUEST,
      userId: toUser,
      payload: { userId: fromUser }
    });
    res.json({ userId: toUser });
  })
);

router.delete(
  "/friendRequests/:requesterId/reject",
  authenticateUser,
  validators.rejectFriendRequest,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: toUser, requesterId: fromUser } = req.payload;
    await UserService.deleteFriendRequest({
      userId1: fromUser,
      userId2: toUser
    });
    publisher({
      type: USER_EVENTS.WS_DELETE_SENT_FRIEND_REQUEST,
      userId: fromUser,
      payload: { userId: toUser }
    });
    res.json({ userId: fromUser });
  })
);

router.post(
  "/friends",
  authenticateUser,
  validators.acceptFriendRequest,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: toUser, requesterId: fromUser } = req.payload;
    const { channel, messages, users } = await UserService.addFriend({
      userId1: fromUser,
      userId2: toUser
    });
    publisher({
      type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      userId: toUser,
      channelId: channel.id,
      payload: {
        userId: fromUser,
        channelId: channel.id,
        type: "friend"
      }
    });
    publisher({
      type: USER_EVENTS.WS_ADD_FRIEND,
      userId: fromUser,
      channelId: channel.id,
      payload: {
        userId: toUser,
        channelId: channel.id,
        type: "friend",
        channel,
        users,
        messages
      }
    });
    res.json({
      userId: fromUser,
      channelId: channel.id,
      channel,
      messages,
      users
    });
  })
);

router.delete(
  "/friends/:friendId",
  authenticateUser,
  validators.deleteFriend,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, friendId } = req.payload;
    const deletedChannel = await UserService.deleteFriend({
      userId1: userId,
      userId2: friendId
    });
    publisher({
      type: USER_CHANNEL_EVENTS.WS_UNFRIEND,
      userId: friendId,
      channelId: deletedChannel.id,
      payload: { userId, channelId: deletedChannel.id }
    });
    res.json({ userId: friendId, channelId: deletedChannel.id });
  })
);

router.post(
  "/blocks/",
  authenticateUser,
  validators.addBlock,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: fromUser, blockedId: toUser } = req.payload;
    const blockedInfo = await UserService.addBlock({ fromUser, toUser });

    if (blockedInfo.isFriend) {
      publisher({
        type: USER_CHANNEL_EVENTS.WS_BLOCK_FRIEND,
        channelId: blockedInfo.channelId,
        userId: toUser,
        payload: { userId: fromUser, channelId: blockedInfo.channelId }
      });
    } else {
      publisher({
        type: USER_EVENTS.WS_ADD_BLOCKER,
        userId: toUser,
        payload: { userId: fromUser }
      });
    }

    res.status(201).json({
      userId: toUser,
      channelId: blockedInfo.channelId,
      user: blockedInfo.user
    });
  })
);

router.delete(
  "/blocks/:blockedId",
  authenticateUser,
  validators.deleteFriend,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId: fromUser, blockedId: toUser } = req.payload;
    await UserService.deleteBlock({ fromUser, toUser });
    publisher({
      type: USER_EVENTS.WS_DELETE_BLOCKER,
      userId: toUser,
      payload: { userId: fromUser }
    });
    res.json({ userId: toUser });
  })
);

module.exports = router;
