const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addChannel = require("../../../database/queries/addChannel");
const addMembers = require("../../../database/queries/addMembers");
const getUsers = require("../../../database/queries/getUsers");
const database = require("../../../config/database");
const { publisher } = require("../../../config/pubSub");
const {
  WS_ADD_CHANNEL,
  WS_SUBSCRIBE_CHANNEL
} = require("../../../config/constants");

router.post(
  "/room",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        userIds: Joi.array()
          .items(
            Joi.string()
              .uuid()
              .required()
          )
          .min(2)
          .max(19)
          .unique()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { userIds } = req.body;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      if (userIds.includes(userId)) throw new ApiError();

      const newUserIds = [userId, ...userIds];
      const channel = await addChannel({ type: "group" }, client);

      if (!channel) throw new ApiError();

      const newMembers = await addMembers(
        { channelId: channel.id, userIds: newUserIds },
        client
      );

      channel.members = newMembers.map(member => member.userId);

      const users = await getUsers({ userIds: channel.members }, client);

      await client.query("COMMIT");

      res.status(201).json({
        channelId: channel.id,
        channel
      });

      publisher({
        type: WS_SUBSCRIBE_CHANNEL,
        channelId: channel.id,
        userId,
        payload: {
          userId,
          channelId: channel.id,
          type: "channel"
        }
      });

      userIds.forEach(uid => {
        publisher({
          type: WS_ADD_CHANNEL,
          channelId: channel.id,
          userId: uid,
          payload: {
            channel,
            users,
            channelId: channel.id,
            type: "group"
          }
        });
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
