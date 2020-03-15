const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteMember = require("../../../database/queries/deleteMember");
const getChannelPublicAndTypeAndOwner = require("../../../database/queries/getChannelPublicAndTypeAndOwner");
const { publisher } = require("../../../config/pubSub");
const { WS_LEAVE_CHANNEL } = require("../../../config/constants");

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
      const channelPublicAndTypeAndOwner = await getChannelPublicAndTypeAndOwner(
        {
          channelId
        }
      );

      if (!channelPublicAndTypeAndOwner) throw new ApiError();

      const { ownerId } = channelPublicAndTypeAndOwner;

      if (userId === ownerId) throw new ApiError();

      const deletedMember = await deleteMember({
        channelId,
        userId
      });

      if (!deletedMember) throw new ApiError();

      res.status(200).json(deletedMember);

      publisher({
        type: WS_LEAVE_CHANNEL,
        userId,
        channelId,
        initiator: userId,
        payload: {
          ...deletedMember,
          ...channelPublicAndTypeAndOwner
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
