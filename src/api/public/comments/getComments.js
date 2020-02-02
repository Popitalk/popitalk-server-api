const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getComments = require("../../../database/queries/getComments");

router.get(
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
      .required(),
    query: Joi.object()
      .keys({
        limit: Joi.number()
          .integer()
          .positive()
          .optional()
      })
      .optional()
  }),
  async (req, res, next) => {
    const { postId } = req.params;
    const { limit } = req.query;
    const { id: userId } = req.user;

    try {
      const comments = await getComments({
        postId,
        userId,
        limit
      });

      if (!comments) throw new ApiError(`Comments couldn't be retrieved`, 404);

      res.json(comments);
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
