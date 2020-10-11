const Joi = require("@hapi/joi");
const { WS_EVENTS } = require("../config/constants");
const publisher = require("../config/publisher");
const MessageService = require("../services/MessageService");
const NotificationService = require("../services/NotificationService");
const validators = require("../helpers/validators");

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
      validate: validators.messages["POST /"].req,
      response: {
        status: {
          201: validators.messages["POST /"].res
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
      validate: validators.messages["GET /{channelId}"].req,
      response: {
        status: {
          200: validators.messages["GET /{channelId}"].res
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const { afterMessageId, beforeMessageId } = req.query;
      const messages = await MessageService.getMessages({
        userId,
        channelId,
        afterMessageId,
        beforeMessageId
      });

      return { ...messages, channelId, afterMessageId, beforeMessageId };
    }
  },
  {
    method: "DELETE",
    path: "/{messageId}",
    options: {
      description: "Deletes message",
      tags: ["api"],
      validate: validators.messages["/{messageId}"].req,
      response: {
        status: {
          200: validators.messages["/{messageId}"].res
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
