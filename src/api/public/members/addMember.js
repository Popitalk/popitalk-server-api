const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addChannelMember = require("../../../database/queries/addChannelMember");
const getChannelPublicAndTypeAndOwner = require("../../../database/queries/getChannelPublicAndTypeAndOwner");
const { publisher } = require("../../../config/pubSub");
const { WS_JOIN_CHANNEL } = require("../../../config/constants");

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
      const channelPublicAndTypeAndOwner = await getChannelPublicAndTypeAndOwner(
        {
          channelId
        }
      );

      if (!channelPublicAndTypeAndOwner) throw new ApiError();

      const { type, public } = channelPublicAndTypeAndOwner;

      if (public) {
        const newMember = await addChannelMember({
          channelId,
          userId
        });

        if (!newMember) throw new ApiError();

        res.status(201).json({
          userId,
          channelId,
          type,
          user: newMember.user
        });

        publisher({
          type: WS_JOIN_CHANNEL,
          userId,
          channelId,
          initiator: userId,
          payload: {
            userId,
            channelId,
            type,
            user: newMember.user
          }
        });
      } else {
        res.send({});
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
