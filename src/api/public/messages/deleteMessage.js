const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteMessage = require("../../../database/queries/deleteMessage");
const getLastMessageInfo = require("../../../database/queries/getLastMessageInfo");
const database = require("../../../config/database");
const { publisher } = require("../../../config/pubSub");
const { WS_DELETE_MESSAGE } = require("../../../config/constants");

router.delete(
  "/:messageId",
  // cache,
  authenticateUser,
  celebrate({
    params: Joi.object()
      .keys({
        messageId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { messageId } = req.params;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      const deletedMessage = await deleteMessage({ messageId, userId }, client);

      const { channelId } = deletedMessage;

      if (!deletedMessage) throw new ApiError();

      const lastMessageInfo = await getLastMessageInfo({ channelId }, client);

      if (!getLastMessageInfo) throw new ApiError();

      await client.query("COMMIT");

      res.status(200).json({ ...deletedMessage, ...lastMessageInfo });

      publisher({
        type: WS_DELETE_MESSAGE,
        channelId,
        initiator: userId,
        payload: {
          userId,
          channelId,
          ...deletedMessage,
          ...lastMessageInfo
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    } finally {
      client.release();
    }
  }
);

module.exports = router;
