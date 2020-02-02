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
      const posts = await getPosts({
        channelId,
        userId,
        beforePostId
      });

      if (!posts) throw new ApiError(`Posts couldn't be retrieved`, 404);

      response = {
        posts
      };

      let comments = {};

      posts.forEach(post => {
        if (post.comments.length !== 0) {
          comments = {
            ...comments,
            [post.id]: post.comments
          };
        }
        // eslint-disable-next-line no-param-reassign
        delete post.comments;
      });

      if (isEmpty(comments)) {
        comments = null;
      }
      response = {
        ...response,
        comments
      };

      res.json(response);
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
