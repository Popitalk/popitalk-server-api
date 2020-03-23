const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const reqPayload = require("../helpers/middleware/reqPayload");
const CommentService = require("../services/CommentService");
const validators = require("../helpers/validators");
const { publisher } = require("../config/pubSub");
const { CHANNEL_EVENTS } = require("../config/constants");

router.post(
  "/",
  authenticateUser,
  validators.addComment,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const addedComment = await CommentService.addComment(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_COMMENT,
      channelId: addedComment.channelId,
      initiator: userId,
      payload: addedComment
    });
    res.status(201).json(addedComment);
  })
);

router.get(
  "/:postId",
  authenticateUser,
  validators.getComments,
  reqPayload,
  asyncHandler(async (req, res) => {
    const comments = await CommentService.getComments(req.payload);
    res.json(comments);
  })
);

router.delete(
  "/:commentId",
  authenticateUser,
  validators.deleteComment,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const deletedComment = await CommentService.deleteComment(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_COMMENT,
      channelId: deletedComment.channelId,
      initiator: userId,
      payload: {
        userId,
        channelId: deletedComment.channelId,
        ...deletedComment
      }
    });
    res.status(200).json(deletedComment);
  })
);

router.post(
  "/:commentId/likes",
  authenticateUser,
  validators.addCommentLike,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const newLike = await CommentService.addCommentLike(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_ADD_COMMENT_LIKE,
      channelId: newLike.channelId,
      initiator: userId,
      payload: newLike
    });
    res.status(201).json(newLike);
  })
);

router.delete(
  "/:commentId/likes",
  authenticateUser,
  validators.addCommentLike,
  reqPayload,
  asyncHandler(async (req, res) => {
    const { userId } = req.payload;
    const deletedLike = await CommentService.addCommentLike(req.payload);
    publisher({
      type: CHANNEL_EVENTS.WS_DELETE_COMMENT_LIKE,
      channelId: deletedLike.channelId,
      initiator: userId,
      payload: deletedLike
    });
    res.status(200).json(deletedLike);
  })
);

module.exports = router;
