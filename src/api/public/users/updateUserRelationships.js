const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const getUserRelationship = require("../../../database/queries/getUserRelationship");
const addUserRelationship = require("../../../database/queries/addUserRelationship");
const updateUserRelationship = require("../../../database/queries/updateUserRelationship");
const deleteUserRelationship = require("../../../database/queries/deleteUserRelationship");
const addChannel = require("../../../database/queries/addChannel");
const addMembers = require("../../../database/queries/addMembers");
const getFriendRoomId = require("../../../database/queries/getFriendRoomId");
const deleteChannel = require("../../../database/queries/deleteChannel");

const database = require("../../../config/database");

const friendFirstSecond = "friend_first_second";
const friendSecondFirst = "friend_second_first";
const friendBoth = "friend_both";
const blockFirstSecond = "block_first_second";
const blockSecondFirst = "block_second_first";
const blockBoth = "block_both";
const friend = "friend";
const unfriend = "unfriend";
const block = "block";
const unblock = "unblock";

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
          .valid("friend", "unfriend", "block", "unblock")
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: fromUser } = req.user;
    const { userId: toUser, type } = req.body;

    const client = await database.connect();
    try {
      await client.query("BEGIN");
      const userRelationship = await getUserRelationship(
        { fromUser, toUser },
        client
      );

      let firstUserId;
      let secondUserId;
      let oldType;

      if (userRelationship) {
        firstUserId = userRelationship.firstUserId;
        secondUserId = userRelationship.secondUserId;
        oldType = userRelationship.type;
      }

      if (type === friend) {
        if (oldType === friendFirstSecond || oldType === friendSecondFirst) {
          await updateUserRelationship(
            { firstUserId, secondUserId, type: friendBoth },
            client
          );
          const room = await addChannel({ type: "room" }, client);
          await addMembers(
            { channelId: room.id, userIds: [firstUserId, secondUserId] },
            client
          );
        } else if (!oldType) {
          await addUserRelationship({ fromUser, toUser, type: friend }, client);
        }
      } else if (type === unfriend) {
        if (
          oldType === friendFirstSecond ||
          oldType === friendSecondFirst ||
          oldType === friendBoth
        ) {
          await deleteUserRelationship({ firstUserId, secondUserId }, client);
        }
        if (oldType === friendBoth) {
          const room = await getFriendRoomId(
            { userId1: firstUserId, userId2: secondUserId },
            client
          );
          await deleteChannel({ channelId: room.channelId }, client);
        }
      } else if (type === block) {
        if (
          oldType === friendFirstSecond ||
          oldType === friendSecondFirst ||
          oldType === friendBoth
        ) {
          await updateUserRelationship(
            {
              firstUserId,
              secondUserId,
              type: fromUser < toUser ? blockFirstSecond : blockSecondFirst
            },
            client
          );
        } else if (
          oldType === blockFirstSecond ||
          oldType === blockSecondFirst
        ) {
          await updateUserRelationship(
            { firstUserId, secondUserId, type: blockBoth },
            client
          );
        } else if (!oldType) {
          await addUserRelationship({ fromUser, toUser, type: block }, client);
        }
        if (oldType === friendBoth) {
          const room = await getFriendRoomId(
            { userId1: firstUserId, userId2: secondUserId },
            client
          );
          await deleteChannel({ channelId: room.channelId }, client);
        }
      } else if (type === unblock) {
        if (oldType === blockBoth) {
          await updateUserRelationship(
            {
              firstUserId,
              secondUserId,
              type: fromUser < toUser ? blockSecondFirst : blockFirstSecond
            },
            client
          );
        } else if (
          oldType === blockFirstSecond ||
          oldType === blockSecondFirst
        ) {
          await deleteUserRelationship({ firstUserId, secondUserId }, client);
        }
      }

      await client.query("COMMIT");
      res.status(201).json({});
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
