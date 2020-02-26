const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deletePostLike = require("../../../database/queries/deletePostLike");
const deleteCommentLike = require("../../../database/queries/deleteCommentLike");
const { publisher } = require("../../../config/pubSub");
const { WS_DELETE_POST_LIKE } = require("../../../config/constants");

router.delete(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    query: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .optional(),
        commentId: Joi.string()
          .uuid()
          .optional()
      })
      .xor("postId", "commentId")
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { postId, commentId } = req.query;
    let deletedLike;

    try {
      if (postId) {
        deletedLike = await deletePostLike({
          postId,
          userId
        });
      } else if (commentId) {
        deletedLike = await deleteCommentLike({
          commentId,
          userId
        });
      }

      if (!deletedLike) throw new ApiError();

      res.status(201).json(deletedLike);

      if (postId) {
        publisher({
          type: WS_DELETE_POST_LIKE,
          channelId: deletedLike.channelId,
          initiator: userId,
          payload: deletedLike
        });
      } else if (commentId) {
        // newLike = await addCommentLike({
        //   commentId,
        //   userId
        // });
      }
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
