const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { isEmpty } = require("lodash");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getPosts = require("../../../database/queries/getPosts");

router.get(
  "/:channelId",
  // cache,
  authenticateUser,
  celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    query: Joi.object()
      .keys({
        beforePostId: Joi.string()
          .uuid()
          .optional()
      })
      .optional()
  }),
  async (req, res, next) => {
    const { channelId } = req.params;
    const { beforePostId } = req.query;
    const { id: userId } = req.user;
    let response;

    try {
      const gottenPosts = await getPosts({
        channelId,
        userId,
        beforePostId
      });

      if (!gottenPosts) throw new ApiError(`Posts couldn't be retrieved`, 404);

      const { posts, comments } = gottenPosts;

      res.json({
        channelId,
        posts,
        comments
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
