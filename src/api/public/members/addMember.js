const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addChannelMember = require("../../../database/queries/addChannelMember");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(2000)
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId } = req.body;

    try {
      const newMember = await addChannelMember({
        channelId,
        userId
      });

      if (!newMember) throw new ApiError();

      res.status(201).json(newMember);
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
