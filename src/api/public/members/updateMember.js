const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const adminMember = require("../../../database/queries/adminMember");
const unadminMember = require("../../../database/queries/unadminMember");
const banMember = require("../../../database/queries/banMember");
const unbanMember = require("../../../database/queries/unbanMember");

router.put(
  "/",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        userId: Joi.string()
          .uuid()
          .required(),
        type: Joi.string()
          .valid("admin", "unadmin", "ban", "unban")
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: fromUser } = req.user;
    const { channelId, userId: toUser, type } = req.body;
    let updatedMember;

    try {
      if (type === "admin") {
        updatedMember = await adminMember({
          channelId,
          fromUser,
          toUser
        });
      } else if (type === "unadmin") {
        updatedMember = await unadminMember({
          channelId,
          fromUser,
          toUser
        });
      } else if (type === "ban") {
        updatedMember = await banMember({
          channelId,
          fromUser,
          toUser
        });
      } else if (type === "unban") {
        updatedMember = await unbanMember({
          channelId,
          fromUser,
          toUser
        });
      }

      if (!updatedMember) throw new ApiError();

      res.json(updatedMember);
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
