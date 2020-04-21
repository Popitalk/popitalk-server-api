const Joi = require("@hapi/joi");
const { CHANNEL_EVENTS } = require("../config/constants");
const { publisher } = require("../config/pubSub");
const MessageService = require("../services/MessageService");

const messsageSchema = Joi.object().keys({
  id: Joi.string()
    .uuid()
    .required(),
  channelId: Joi.string()
    .uuid()
    .required(),
  userId: Joi.string()
    .uuid()
    .required(),
  content: Joi.string()
    .min(1)
    .max(2000)
    .required(),
  upload: Joi.string()
    .uri()
    .allow(null)
    .required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  author: Joi.object()
    .keys({
      id: Joi.string()
        .uuid()
        .required(),
      username: Joi.string().required(),
      avatar: Joi.string()
        .uri()
        .allow(null)
        .required()
    })
    .required()
});

const controllers = [
  {
    method: "POST",
    path: "/",
    options: {
      description: "Adds message",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required(),
            content: Joi.string()
              .min(1)
              .max(2000)
          })
          .required()
      },
      response: {
        status: {
          201: messsageSchema.label("addMessageResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.payload;
      const newMessage = await MessageService.addMessage({
        userId,
        ...req.payload
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_ADD_MESSAGE,
      //   channelId,
      //   initiator: userId,
      //   payload: {
      //     userId,
      //     channelId,
      //     message: newMessage
      //   }
      // });
      return res.response(newMessage).code(201);
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
          .required(),
        query: Joi.object()
          .keys({
            afterMessageId: Joi.string()
              .uuid()
              .optional(),
            beforeMessageId: Joi.string()
              .uuid()
              .optional()
          })
          .optional()
      },
      response: {
        status: {
          200: Joi.array()
            .items(messsageSchema)
            .required()
            .label("getMessagesResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const messages = await MessageService.getMessages({
        userId,
        ...req.params,
        ...req.query
      });
      return messages;
    }
  },
  {
    method: "DELETE",
    path: "/{messageId}",
    options: {
      description: "Deletes message",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            messageId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      },
      response: {
        status: {
          200: Joi.object()
            .keys({
              id: Joi.string()
                .uuid()
                .required(),
              channelId: Joi.string()
                .uuid()
                .required(),
              firstMessageId: Joi.string()
                .uuid()
                .allow(null)
                .required(),
              lastMessageId: Joi.string()
                .uuid()
                .allow(null)
                .required(),
              lastMessageAt: Joi.date()
                .iso()
                .allow(null)
                .required()
            })
            .required()
            .label("deleteMessageResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { messageId } = req.params;
      const deletedMessage = await MessageService.deleteMessage({
        userId,
        messageId
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_DELETE_MESSAGE,
      //   channelId: deletedMessage.channelId,
      //   initiator: userId,
      //   payload: {
      //     userId,
      //     channelId: deletedMessage.channelId,
      //     ...deletedMessage
      //   }
      // });
      return deletedMessage;
    }
  }
];

const MessageController = {
  name: "MessageController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = MessageController;
