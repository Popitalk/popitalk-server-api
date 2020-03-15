const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addComment = require("../../../database/queries/addComment");
const { publisher } = require("../../../config/pubSub");
const { WS_ADD_COMMENT } = require("../../../config/constants");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(2000)
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { postId, content } = req.body;

    try {
      const newComment = await addComment({
        postId,
        userId,
        content
      });

      if (!newComment) throw new ApiError();

      res.status(201).json(newComment);

      delete newComment.selfCommentCount;

      publisher({
        type: WS_ADD_COMMENT,
        channelId: newComment.channelId,
        initiator: userId,
        payload: newComment
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
