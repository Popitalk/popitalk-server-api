const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addPostLike = require("../../../database/queries/addPostLike");
const addCommentLike = require("../../../database/queries/addCommentLike");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
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
    const { postId, commentId } = req.body;
    let newLike;

    try {
      if (postId) {
        newLike = await addPostLike({
          postId,
          userId
        });
      } else if (commentId) {
        newLike = await addCommentLike({
          commentId,
          userId
        });
      }

      if (!newLike) throw new ApiError();

      res.status(201).json(newLike);
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
