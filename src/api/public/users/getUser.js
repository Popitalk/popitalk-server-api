const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getUser = require("../../../database/queries/getUser");

router.get(
  "/:userId",
  // cache,
  authenticateUser,
  celebrate({
    params: Joi.object()
      .keys({
        userId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { userId } = req.params;

    try {
      const user = await getUser({ userId });

      if (!user) throw new ApiError(`User with id ${userId} not found`, 404);

      res.json({
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar
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
