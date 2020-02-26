const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const database = require("../../../config/database");
const adminMember = require("../../../database/queries/adminMember");
const unadminMember = require("../../../database/queries/unadminMember");
const banMember = require("../../../database/queries/banMember");
const unbanMember = require("../../../database/queries/unbanMember");
const deleteMember = require("../../../database/queries/deleteMember");
const getUsers = require("../../../database/queries/getUsers");
const getBanned = require("../../../database/queries/getBanned");
const { publisher } = require("../../../config/pubSub");
const {
  WS_ADD_ADMIN,
  WS_DELETE_ADMIN,
  WS_ADD_BAN,
  WS_DELETE_BAN
} = require("../../../config/constants");

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

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      if (type === "admin") {
        updatedMember = await adminMember(
          {
            channelId,
            fromUser,
            toUser
          },
          client
        );
        const bannedMembers = await getBanned(
          {
            channelId
          },
          client
        );

        if (bannedMembers.length !== 0) {
          const bannedUsers = await getUsers(
            {
              userIds: bannedMembers
            },
            client
          );

          updatedMember = {
            ...updatedMember,
            banned: bannedMembers,
            users: bannedUsers
          };
        } else {
          updatedMember = {
            ...updatedMember,
            banned: bannedMembers
          };
        }
      } else if (type === "unadmin") {
        updatedMember = await unadminMember(
          {
            channelId,
            fromUser,
            toUser
          },
          client
        );
      } else if (type === "ban") {
        updatedMember = await banMember(
          {
            channelId,
            fromUser,
            toUser
          },
          client
        );
      } else if (type === "unban") {
        updatedMember = await unbanMember(
          {
            channelId,
            fromUser,
            toUser
          },
          client
        );
        const deletedMember = await deleteMember(
          {
            channelId,
            userId: toUser
          },
          client
        );

        if (!deletedMember) throw new ApiError();
      }

      if (!updatedMember) throw new ApiError();

      await client.query("COMMIT");

      res.json(updatedMember);

      if (type === "admin") {
        publisher({
          type: WS_ADD_ADMIN,
          channelId,
          initiator: fromUser,
          payload: updatedMember
        });
      } else if (type === "unadmin") {
        publisher({
          type: WS_DELETE_ADMIN,
          channelId,
          initiator: fromUser,
          payload: updatedMember
        });
      } else if (type === "ban") {
        publisher({
          type: WS_ADD_BAN,
          channelId,
          initiator: fromUser,
          payload: updatedMember
        });
      } else if (type === "unban") {
        publisher({
          type: WS_DELETE_BAN,
          channelId,
          initiator: fromUser,
          payload: updatedMember
        });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    } finally {
      client.release();
    }
  }
);

module.exports = router;
