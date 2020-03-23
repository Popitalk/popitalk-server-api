const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const reqPayload = require("../helpers/middleware/reqPayload");
const PostService = require("../services/PostService");
const validators = require("../helpers/validators");
const { publisher } = require("../config/pubSub");
const { CHANNEL_EVENTS } = require("../config/constants");

router.post(
  "/",
  authenticateUser,
  validators.addPost,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const newPost = await PostService.addPost(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_POST,
      channelId,
      initiator: userId,
      payload: newPost
    });
    res.status(201).json(newPost);
  })
);

router.get(
  "/:channelId",
  authenticateUser,
  validators.getPosts,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { channelId } = req.payload;
    const { posts, comments } = await PostService.getPosts(req.payload);
    res.json({
      channelId,
      posts,
      comments
    });
  })
);

router.delete(
  "/:postId",
  authenticateUser,
  validators.deletePost,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId, channelId } = req.payload;
    const deletedPost = await PostService.deletePost(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_POST,
      channelId,
      initiator: userId,
      payload: {
        userId,
        channelId,
        ...deletedPost
      }
    });
    res.status(200).json(deletedPost);
  })
);

router.post(
  "/:postId/likes",
  authenticateUser,
  validators.addPostLike,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const newLike = await PostService.addPostLike(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_POST_LIKE,
      channelId: newLike.channelId,
      initiator: userId,
      payload: newLike
    });
    res.status(201).json(newLike);
  })
);

router.delete(
  "/:postId/likes",
  authenticateUser,
  validators.addPostLike,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const deletedLike = await PostService.addPostLike(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_POST_LIKE,
      channelId: deletedLike.channelId,
      initiator: userId,
      payload: deletedLike
    });
    res.status(200).json(deletedLike);
  })
);

module.exports = router;
