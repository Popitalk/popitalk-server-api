const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addPost = require("../../../database/queries/addPost");
const { publisher } = require("../../../config/pubSub");
const { WS_ADD_POST } = require("../../../config/constants");

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
          .max(20000)
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId, content } = req.body;

    try {
      const newPost = await addPost({
        channelId,
        userId,
        content
        // upload
      });

      if (!newPost) throw new ApiError();

      res.status(201).json(newPost);

      publisher({
        type: WS_ADD_POST,
        channelId,
        initiator: userId,
        payload: newPost
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