const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addMessage = require("../../../database/queries/addMessage");
const { publisher } = require("../../../config/pubSub");
const { WS_ADD_WATCHER } = require("../../../config/constants");
const redis = require("../../../config/redis");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId } = req.body;

    try {
      await redis.sadd(`watchers:${channelId}`, userId);

      res.status(201).json({
        channelId,
        userId
      });

      publisher({
        type: WS_ADD_WATCHER,
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
