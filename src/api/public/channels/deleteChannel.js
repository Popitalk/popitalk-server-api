const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteChannel = require("../../../database/queries/deleteChannel");
const { publisher } = require("../../../config/pubSub");
const { WS_DELETE_CHANNEL } = require("../../../config/constants");

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
      const deletedChannel = await deleteChannel({ channelId, userId });

      if (!deletedChannel) throw new ApiError();

      res.status(200).json(deletedChannel);

      publisher({
        type: WS_DELETE_CHANNEL,
        channelId,
        initiator: userId,
        payload: {
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
