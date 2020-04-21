const Joi = require("@hapi/joi");
const {
  USER_CHANNEL_EVENTS,
  CHANNEL_EVENTS,
  USER_EVENTS
} = require("../config/constants");
const { publisher } = require("../config/pubSub");
const MemberService = require("../services/MemberService");
const ChannelService = require("../services/ChannelService");

// TODO: Different endpoint for leaving channels and leaving rooms

// TODO: Finished adding, didn't finish the rest

const controllers = [
  {
    method: "POST",
    path: "/{channelId}",
    options: {
      description: "Adds member",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      },
      response: {
        status: {
          201: Joi.object()
            .keys({
              channelId: Joi.string()
                .uuid()
                .required(),
              userId: Joi.string()
                .uuid()
                .required(),
              type: Joi.string()
                .valid("channel")
                .required(),
              user: Joi.object()
                .keys({
                  username: Joi.string().required(),
                  firstName: Joi.string().required(),
                  lastName: Joi.string().required(),
                  avatar: Joi.string()
                    .allow(null)
                    .required()
                })
                .required()
            })
            .required()
            .label("addMemberResponse")
        }
      }
    },
    async handler(req, res) {
      // no need to query for type, assume the type to be channel here
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const { user, type } = await MemberService.addMember({
        channelId,
        userId
      });
      // publisher({
      //   type: USER_CHANNEL_EVENTS.WS_JOIN_CHANNEL,
      //   userId,
      //   channelId,
      //   initiator: userId,
      //   payload: { userId, channelId, user, type }
      // });
      return res.response({ channelId, userId, user, type }).code(201);
    }
  },
  {
    method: "POST",
    path: "/{channelId}/room",
    options: {
      description: "Adds room members",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            userIds: Joi.array()
              .items(
                Joi.string()
                  .uuid()
                  .required()
              )
              .min(1)
              .max(17)
              .unique()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const { userIds } = req.payload;

      const newMembers = await MemberService.addRoomMembers({
        userId,
        channelId,
        userIds
      });

      const { channel, users } = await ChannelService.getChannel({
        userId,
        channelId
      });

      const { user, type } = newMembers;

      publisher({
        type: CHANNEL_EVENTS.WS_ADD_MEMBERS,
        channelId,
        initiator: userId,
        payload: {
          channelId,
          userIds,
          users
        }
      });

      userIds.forEach(uid => {
        publisher({
          type: USER_CHANNEL_EVENTS.WS_ADD_CHANNEL,
          channelId,
          userId: uid,
          payload: {
            channel,
            users,
            channelId,
            type: "group"
          }
        });
      });

      return res.response({ userId, channelId, user, type }).code(201);
    }
  },
  {
    method: "DELETE",
    path: "/{channelId}",
    options: {
      description: "Deletes member",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      await MemberService.deleteMember({ userId, channelId });
      publisher({
        type: USER_CHANNEL_EVENTS.WS_LEAVE_CHANNEL,
        userId,
        channelId,
        initiator: userId,
        payload: { channelId, userId }
      });
      return { channelId, userId };
    }
  },
  {
    method: "POST",
    path: "/{channelId}/admins",
    options: {
      description: "Adds admin",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            adminId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: fromUser } = req.auth.credentials;
      const { channelId } = req.params;
      const { adminId: toUser } = req.payload;
      const memberInfo = await MemberService.addAdmin({
        channelId,
        fromUser,
        toUser
      });
      publisher({
        type: CHANNEL_EVENTS.WS_ADD_ADMIN,
        channelId,
        initiator: fromUser,
        payload: { channelId, userId: toUser }
      });
      return { channelId, ...memberInfo };
    }
  },
  {
    method: "DELETE",
    path: "/{channelId}/admins/{adminId}",
    options: {
      description: "Deletes admin",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required(),
            adminId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: fromUser } = req.auth.credentials;
      const { channelId, adminId: toUser } = req.params;
      const memberInfo = await MemberService.deleteAdmin({
        channelId,
        fromUser,
        toUser
      });
      publisher({
        type: CHANNEL_EVENTS.WS_DELETE_ADMIN,
        channelId,
        initiator: fromUser,
        payload: { channelId, userId: toUser }
      });
      return { channelId, ...memberInfo };
    }
  },
  {
    method: "POST",
    path: "/{channelId}/bans",
    options: {
      description: "Adds ban",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            bannedId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: fromUser } = req.auth.credentials;
      const { channelId } = req.params;
      const { bannedId: toUser } = req.payload;
      const memberInfo = await MemberService.addBan({
        channelId,
        fromUser,
        toUser
      });
      publisher({
        type: CHANNEL_EVENTS.WS_ADD_BAN,
        channelId,
        initiator: fromUser,
        payload: { channelId, userId: toUser }
      });
      return { channelId, ...memberInfo };
    }
  },
  {
    method: "DELETE",
    path: "/{channelId}/bans/{bannedId}",
    options: {
      description: "Deletes ban",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required(),
            bannedId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: fromUser } = req.auth.credentials;
      const { channelId, bannedId: toUser } = req.params;
      const memberInfo = await MemberService.deleteBan({
        channelId,
        fromUser,
        toUser
      });
      publisher({
        type: CHANNEL_EVENTS.WS_DELETE_BAN,
        channelId,
        initiator: fromUser,
        payload: { channelId, userId: toUser }
      });
      return { channelId, ...memberInfo };
    }
  }
];

const MemberController = {
  name: "MemberController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = MemberController;
