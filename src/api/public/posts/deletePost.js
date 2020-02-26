const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deletePost = require("../../../database/queries/deletePost");
const getLastPostInfo = require("../../../database/queries/getLastPostInfo");
const database = require("../../../config/database");
const { publisher } = require("../../../config/pubSub");
const { WS_DELETE_POST } = require("../../../config/constants");

router.delete(
  "/:postId",
  // cache,
  authenticateUser,
  celebrate({
    params: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { postId } = req.params;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      const deletedPost = await deletePost({ postId, userId }, client);

      const { channelId } = deletedPost;

      if (!deletedPost) throw new ApiError();

      const lastPostInfo = await getLastPostInfo({ channelId }, client);

      if (!getLastPostInfo) throw new ApiError();

      await client.query("COMMIT");

      res.status(200).json({ ...deletedPost, ...lastPostInfo });

      publisher({
        type: WS_DELETE_POST,
        channelId,
        initiator: userId,
        payload: {
          userId,
          channelId,
          ...deletedPost,
          ...lastPostInfo
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
