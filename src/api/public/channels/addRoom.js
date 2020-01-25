const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addChannel = require("../../../database/queries/addChannel");
const addMembers = require("../../../database/queries/addMembers");
const database = require("../../../config/database");

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
      const newUserIds = [userId, ...userIds];
      const newRoom = await addChannel({ type: "group" }, client);

      if (!newRoom) throw new ApiError();

      const newMembers = await addMembers(
        { channelId: newRoom.id, userIds: newUserIds },
        client
      );

      await client.query("COMMIT");
      res.status(201).json({
        ...newRoom,
        users: newMembers.map(member => member.userId)
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
