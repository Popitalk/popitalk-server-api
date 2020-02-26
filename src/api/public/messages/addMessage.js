const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addMessage = require("../../../database/queries/addMessage");
const { publisher } = require("../../../config/pubSub");
const { WS_ADD_MESSAGE } = require("../../../config/constants");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(2000)
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId, content } = req.body;

    try {
      const newMessage = await addMessage({
        channelId,
        userId,
        content
        // upload
      });

      if (!newMessage) throw new ApiError();

      res.status(201).json(newMessage);

      publisher({
        type: WS_ADD_MESSAGE,
        channelId,
        initiator: userId,
        payload: {
          userId,
          channelId,
          message: newMessage
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
