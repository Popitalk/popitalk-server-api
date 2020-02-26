/* eslint-disable prefer-const */
const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { isEmpty } = require("lodash");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getRoomChannel = require("../../../database/queries/getRoomChannel");
const getAdminChannel = require("../../../database/queries/getAdminChannel");
const getPublicChannel = require("../../../database/queries/getPublicChannel");
const getPrivateChannel = require("../../../database/queries/getPrivateChannel");
const getUsers = require("../../../database/queries/getUsers");
const getMessages = require("../../../database/queries/getMessages");
const getPosts = require("../../../database/queries/getPosts");
const getChannelTypePublicMemberAdminBanned = require("../../../database/queries/getChannelTypePublicMemberAdminBanned");
const { publisher } = require("../../../config/pubSub");
const { WS_SUBSCRIBE_CHANNEL } = require("../../../config/constants");

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
      const channelInfo = await getChannelTypePublicMemberAdminBanned({
        channelId,
        userId
      });

      if (!channelInfo)
        throw new ApiError(`Channel with id ${channelId} not found`, 404);

      const { type, isPublic, isMember, isAdmin, isBanned } = channelInfo;

      if (isBanned) {
        throw new ApiError(`You're banned fromt his channel`, 401);
      } else if (type !== "channel" && isMember) {
        const channel = await getRoomChannel({ channelId });
        const users = await getUsers({ userIds: channel.members });
        const messages = await getMessages({ channelId });
        response = {
          channel,
          users,
          messages
        };
      } else if (isAdmin) {
        const channel = await getAdminChannel({ channelId });
        const users = await getUsers({ userIds: channel.members });
        const banned = await getUsers({ userIds: channel.banned });
        const messages = await getMessages({ channelId });
        const postsAndComments = await getPosts({
          channelId,
          userId,
          validateMember: false
        });
        // console.log("comments", comments);
        response = {
          channel,
          users: {
            ...users,
            ...banned
          },
          messages,
          ...postsAndComments
        };
      } else if (isMember || isPublic) {
        const channel = await getPublicChannel({ channelId });
        const users = await getUsers({ userIds: channel.members });
        const messages = await getMessages({ channelId });
        let postsAndComments = await getPosts({
          channelId,
          userId,
          validateMember: false
        });
        response = {
          channel,
          users,
          messages,
          ...postsAndComments
        };
      } else if (!isMember && !isPublic) {
        const channel = await getPrivateChannel({ channelId });
        const users = await getUsers({ userIds: channel.admins });
        response = {
          channel,
          users
        };
      }
      res.json({
        channelId,
        ...response
      });
      // Check also if private, in that case don't subscribe
      if (!isMember && isPublic) {
        publisher({
          type: WS_SUBSCRIBE_CHANNEL,
          channelId,
          userId,
          payload: {
            userId,
            channelId,
            type: "channel"
          }
        });
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
