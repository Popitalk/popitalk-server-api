const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { isEmpty } = require("lodash");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getChannel = require("../../../database/queries/getChannel");

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
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId } = req.params;
    let response;

    try {
      const channel = await getChannel({ channelId, userId });

      if (!channel)
        throw new ApiError(`Channel with id ${channelId} not found`, 404);

      response = channel;

      if (response.posts) {
        let comments = {};

        response.posts.forEach(post => {
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
      }
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
