const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const updateUserRelationship = require("../../../database/queries/updateUserRelationship");

router.put(
  "/relationships",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        userId: Joi.string()
          .uuid()
          .required(),
        type: Joi.string()
          .valid("friend", "reject", "block", "unblock")
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId1 } = req.user;
    const { userId: userId2, type } = req.body;

    try {
      await updateUserRelationship({
        userId1,
        userId2,
        type
      });

      res.status(201).json({});
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
