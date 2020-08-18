const Joi = require("@hapi/joi");
// const { WS_EVENTS } = require("../config/constants");
const publisher = require("../config/publisher");
const ChannelService = require("../services/ChannelService");
const ranker = require("../ranking/ranker");

const playerValidation = {
  params: Joi.object()
    .keys({
      channelId: Joi.string()
        .uuid()
        .required()
    })
    .required(),
  payload: Joi.object()
    .keys({
      queueStartPosition: Joi.number().required(),
      clockStartTime: Joi.string().required(),
      videoStartTime: Joi.number().required()
    })
    .required()
};

const playerReturnKeys = {
  channelId: Joi.string()
    .uuid()
    .required(),
  queueStartPosition: Joi.number().required(),
  clockStartTime: Joi.date().timestamp(),
  videoStartTime: Joi.number().required()
};

const controllers = [
  {
    method: "POST",
    path: "/",
    options: {
      description: "Adds channel",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
      validate: {
        payload: Joi.object()
          .keys({
            name: Joi.string()
              .min(3)
              .max(20)
              .required(),
            description: Joi.string()
              .min(1)
              .max(150)
              .required(),
            icon: Joi.optional().meta({ swaggerType: "file" }),
            public: Joi.boolean().required()
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
              channel: Joi.object().keys({
                id: Joi.string()
                  .uuid()
                  .required(),
                type: Joi.string()
                  .valid("channel")
                  .required(),
                name: Joi.string().required(),
                description: Joi.string().required(),
                icon: Joi.string()
                  .uri()
                  .allow(null)
                  .required(),
                public: Joi.boolean()
                  .valid()
                  .required(),
                owner_id: Joi.string()
                  .uuid()
                  .required(),
                status: Joi.string().required(),
                queueStartPosition: Joi.number().required(),
                videoStartTime: Joi.number().required(),
                clockStartTime: Joi.string().required(),
                created_at: Joi.date()
                  .iso()
                  .required(),
                firstMessageId: Joi.string()
                  .uuid()
                  .valid(null)
                  .required(),
                lastMessageId: Joi.string()
                  .uuid()
                  .valid(null)
                  .required(),
                lastMessageAt: Joi.string()
                  .uuid()
                  .valid(null)
                  .required(),
                firstPostId: Joi.string()
                  .uuid()
                  .valid(null)
                  .required(),
                lastPostId: Joi.string()
                  .uuid()
                  .valid(null)
                  .required(),
                lastPostAt: Joi.date()
                  .iso()
                  .valid(null)
                  .required(),
                members: Joi.array()
                  .items(Joi.string().uuid())
                  .length(1)
                  .required(),
                admins: Joi.array()
                  .length(1)
                  .required(),
                banned: Joi.array()
                  .length(0)
                  .required()
              }),
              users: Joi.object()
                .length(1)
                .required(),
              messages: Joi.array()
                .length(0)
                .required(),
              posts: Joi.array()
                .length(0)
                .required(),
              comments: Joi.object().required()
            })
            .required()
            .label("addChannelResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const {
        channel,
        users,
        messages,
        posts,
        comments
      } = await ChannelService.addChannel({
        ...req.payload,
        userId
      });
      // publisher({
      //   type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      //   channelId: newChannel.id,
      //   userId,
      //   payload: { userId, channelId: newChannel.id, type: "channel" }
      // });
      return res
        .response({
          channelId: channel.id,
          channel,
          users,
          messages,
          posts,
          comments
        })
        .code(201);
    }
  },
  {
    method: "POST",
    path: "/rooms",
    options: {
      description: "Adds room",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .keys({
            userIds: Joi.array()
              .items(
                Joi.string()
                  .uuid()
                  .required()
              )
              .min(2)
              .max(7)
              .unique()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { userIds } = req.payload;
      const { channel, users, messages } = await ChannelService.addRoom({
        userId,
        userIds
      });
      // publisher({
      //   type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      //   channelId: channel.id,
      //   userId,
      //   payload: { userId, channelId: channel.id, type: "group" }
      // });
      // userIds.forEach(uid => {
      //   publisher({
      //     type: USER_EVENTS.WS_ADD_CHANNEL,
      //     channelId: channel.id,
      //     userId: uid,
      //     payload: { channel, users, channelId: channel.id, type: "group" }
      //   });
      // });

      return res
        .response({ channelId: channel.id, channel, users, messages })
        .code(201);
    }
  },
  {
    method: "GET",
    path: "/{channelId}",
    options: {
      description: "Gets channel",
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
    // Joi.object().keys({ users: Joi.array().items(mySchema) })
    // multiple response schemas
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      ranker.sentChannel({ channelId, userId });
      const channelInfo = await ChannelService.getChannel({
        userId,
        channelId
      });
      // publisher({
      //   type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
      //   channelId,
      //   userId,
      //   payload: { userId, channelId, type: "channel" }
      // });
      return { channelId, ...channelInfo };
    }
  },
  {
    method: "PUT",
    path: "/{channelId}",
    options: {
      description: "Updates channel",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
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
            name: Joi.string()
              .min(3)
              .max(20)
              .optional(),
            description: Joi.string()
              .min(0)
              .max(150)
              .optional(),
            public: Joi.boolean().optional(),
            icon: Joi.optional().meta({ swaggerType: "file" }),
            removeIcon: Joi.boolean().optional()
          })
          .oxor("icon", "removeIcon")
          .required()
      },
      response: {
        status: {
          201: Joi.object()
            .keys({
              channelId: Joi.string()
                .uuid()
                .required(),
              channel: Joi.object().keys({
                id: Joi.string()
                  .uuid()
                  .required(),
                type: Joi.string()
                  .valid("channel")
                  .required(),
                name: Joi.string().required(),
                description: Joi.string().required(),
                icon: Joi.string()
                  .uri()
                  .allow(null)
                  .required(),
                public: Joi.boolean()
                  .valid()
                  .required(),
                owner_id: Joi.string()
                  .uuid()
                  .required(),
                created_at: Joi.date()
                  .iso()
                  .required()
              })
            })
            .required()
            .label("updateChannelResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const channel = await ChannelService.updateChannel({
        userId,
        channelId,
        ...req.payload
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_UPDATE_CHANNEL,
      //   channelId,
      //   initiator: userId,
      //   payload: { userId, channelId, channel }
      // });

      return { channelId, channel };
    }
  },
  {
    method: "DELETE",
    path: "/{channelId}",
    options: {
      description: "Deletes channel",
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
          200: Joi.object()
            .keys({
              channelId: Joi.string()
                .uuid()
                .required()
            })
            .required()
            .label("deleteChannelResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      await ChannelService.deleteChannel({ userId, channelId });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_DELETE_CHANNEL,
      //   channelId,
      //   initiator: userId,
      //   payload: { channelId }
      // });
      return { channelId };
    }
  },
  {
    method: "PUT",
    path: "/{channelId}/play",
    options: {
      description: "Sets playing status",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
      validate: playerValidation,
      response: {
        status: {
          201: Joi.object()
            .keys(playerReturnKeys)
            .required()
            .label("setPlaying")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const playerStatus = await ChannelService.updatePlayerStatus({
        userId,
        channelId,
        ...req.payload,
        status: "Playing"
      });
      return { channelId, updatedChannel: playerStatus };
    }
  },
  {
    method: "PUT",
    path: "/{channelId}/pause",
    options: {
      description: "Sets paused status",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
      validate: playerValidation,
      response: {
        status: {
          201: Joi.object()
            .keys(playerReturnKeys)
            .required()
            .label("setPaused")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const playerStatus = await ChannelService.updatePlayerStatus({
        userId,
        channelId,
        ...req.payload,
        status: "Paused"
      });
      return { channelId, updatedChannel: playerStatus };
    }
  },
  {
    method: "PUT",
    path: "/{channelId}/skip",
    options: {
      description: "Skips video player to new location",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
      validate: playerValidation,
      response: {
        status: {
          201: Joi.object()
            .keys(playerReturnKeys)
            .required()
            .label("skip")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const playerStatus = await ChannelService.updatePlayerStatus({
        userId,
        channelId,
        ...req.payload
      });
      return { channelId, updatedChannel: playerStatus };
    }
  },
  {
    method: "GET",
    path: "/{channelId}/status",
    options: {
      description: "Gets player status for channel",
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
      const playerStatus = await ChannelService.getPlayerStatus({
        userId,
        channelId
      });

      return { channelId, updatedChannel: playerStatus };
    }
  }
];

const ChannelController = {
  name: "ChannelController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = ChannelController;
