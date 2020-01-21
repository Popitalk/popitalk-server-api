const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addMembers = require("../../../database/queries/addMembers");
const getUsers = require("../../../database/queries/getUsers");
const getMemberIds = require("../../../database/queries/getMemberIds");

router.post(
  "/roomInvite",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        userIds: Joi.array()
          .items(
            Joi.string()
              .uuid()
              .required()
          )
          .min(1)
          .max(17)
          .unique()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { channelId, userIds } = req.body;

    try {
      const memberIds = await getMemberIds({ channelId });
      if (!memberIds || memberIds.length + userIds.length > 20)
        throw new ApiError();

      const newMembers = await addMembers({
        channelId,
        userIds
      });

      if (!newMembers) throw new ApiError();

      const { users } = await getUsers({ userIds });

      if (!users) throw new ApiError();

      res.status(201).json({
        channelId,
        users
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
