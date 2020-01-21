const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getSearchedUsers = require("../../../database/queries/getSearchedUsers");

router.get(
  "",
  // cache,
  authenticateUser,
  celebrate({
    query: Joi.object()
      .keys({
        username: Joi.string()
          .min(1)
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { username } = req.query;

    try {
      const users = await getSearchedUsers({ username });

      if (!users) throw new ApiError(`No users found`, 404);

      res.json(users);
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
