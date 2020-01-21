const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteMember = require("../../../database/queries/deleteMember");
const getMemberIds = require("../../../database/queries/getMemberIds");
const deleteChannel = require("../../../database/queries/deleteChannel");
const database = require("../../../config/database");

router.delete(
  "/rooms/:roomId",
  // cache,
  authenticateUser,
  celebrate({
    params: Joi.object()
      .keys({
        roomId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { roomId: channelId } = req.params;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      const deletedMember = await deleteMember({ channelId, userId }, client);

      if (!deletedMember) throw new ApiError();

      const members = await getMemberIds({ channelId }, client);

      if (!members) {
        const deletedChannel = await deleteChannel({ channelId }, client);

        if (!deletedChannel) throw new ApiError();
      }

      await client.query("COMMIT");
      res.status(204).json({});
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
