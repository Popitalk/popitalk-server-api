const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteMessage = require("../../../database/queries/deleteMessage");

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

    try {
      const deletedMessage = await deleteMessage({ messageId, userId });

      if (!deletedMessage) throw new ApiError();

      res.status(204).json({});
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
