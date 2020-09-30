const Joi = require("@hapi/joi");
const NotificationService = require("../services/NotificationService");

const controllers = [
  {
    method: "DELETE",
    path: "/{channelId}",
    options: {
      description: "Deletes chat notification",
      tags: ["api"],
      validate: {
        params: Joi.object().keys({
          channelId: Joi.string()
            .uuid()
            .required()
        })
      },
      response: {
        status: {
          200: Joi.object({
            channelId: Joi.string()
              .uuid()
              .optional(),
            userId: Joi.string()
              .uuid()
              .optional()
          })
            .required()
            .label("deleteChatNotificationResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;

      const deletedNotification = await NotificationService.deleteChatNotification(
        {
          userId,
          channelId
        }
      );

      return deletedNotification || {};
    }
  }
];

const NotificationController = {
  name: "NotificationController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = NotificationController;
