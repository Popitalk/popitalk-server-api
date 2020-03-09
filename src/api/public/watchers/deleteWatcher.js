const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { publisher } = require("../../../config/pubSub");
const { WS_DELETE_WATCHER } = require("../../../config/constants");
const redis = require("../../../config/redis");

router.delete(
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

    try {
      await redis.srem(`watchers:${channelId}`, userId);

      res.status(201).json({
        channelId,
        userId
      });

      publisher({
        type: WS_DELETE_WATCHER,
        channelId,
        initiator: userId,
        payload: {
          userId,
          channelId
        }
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
