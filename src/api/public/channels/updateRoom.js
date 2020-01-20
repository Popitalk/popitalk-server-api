const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const updateRoom = require("../../../database/queries/updateRoom");

router.put(
  "/rooms/:roomId",
  authenticateUser,
  // invalidateCache,
  celebrate({
    params: Joi.object()
      .keys({
        roomId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(3)
          .max(20)
          .optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { roomId } = req.params;
    const { name } = req.body;

    try {
      const updatedRoom = await updateRoom({
        roomId,
        userId,
        name
      });

      if (!updatedRoom)
        throw new ApiError(`Room with id of ${roomId} not found`, 404);

      res.status(200).json(updatedRoom);
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
