const Joi = require("@hapi/joi");
const { WS_EVENTS } = require("../config/constants");
const publisher = require("../config/publisher");
const MessageService = require("../services/MessageService");
const NotificationService = require("../services/NotificationService");

const messageSchema = Joi.object().keys({
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
              .max(2000),
            upload: Joi.string()
              .allow(null)
              .default(null)
              .optional()
          })
          .required()
      }
      // response: {
      //   status: {
      //     201: messageSchema.label("addMessageResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.payload;
      const newMessage = await MessageService.addMessage({
        userId,
        ...req.payload
      });

      await NotificationService.addChatNotification({
        userId,
        channelId
      });

      const response = { ...newMessage, channelId, userId };

      publisher({
        type: WS_EVENTS.CHANNEL.ADD_MESSAGE,
        channelId,
        initiator: userId,
        payload: response
      });

      return res.response(response).code(201);
    }
  },
  {
    method: "GET",
    path: "/{channelId}",
    options: {
      description: "Gets channel messages",
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
            .items(messageSchema)
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
      }
      // response: {
      //   status: {
      //     200: Joi.object()
      //       .keys({
      //         id: Joi.string()
      //           .uuid()
      //           .required(),
      //         channelId: Joi.string()
      //           .uuid()
      //           .required(),
      //         firstMessageId: Joi.string()
      //           .uuid()
      //           .allow(null)
      //           .required(),
      //         lastMessageId: Joi.string()
      //           .uuid()
      //           .allow(null)
      //           .required(),
      //         lastMessageAt: Joi.date()
      //           .iso()
      //           .allow(null)
      //           .required()
      //       })
      //       .required()
      //       .label("deleteMessageResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { messageId } = req.params;
      const deletedMessage = await MessageService.deleteMessage({
        userId,
        messageId
      });

      const response = deletedMessage;

      publisher({
        type: WS_EVENTS.CHANNEL.DELETE_MESSAGE,
        channelId: deletedMessage.channelId,
        initiator: userId,
        payload: response
      });

      return response;
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
