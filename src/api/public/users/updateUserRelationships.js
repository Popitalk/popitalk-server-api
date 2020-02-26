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
const getUser = require("../../../database/queries/getUser");
const getUsers = require("../../../database/queries/getUsers");
const { publisher } = require("../../../config/pubSub");
const {
  WS_DELETE_SENT_FRIEND_REQUEST,
  WS_ADD_RECEIVED_FRIEND_REQUEST,
  WS_DELETE_RECEIVED_FRIEND_REQUEST,
  WS_ADD_FRIEND,
  WS_DELETE_FRIEND,
  WS_UNFRIEND,
  WS_ADD_BLOCKER,
  WS_DELETE_BLOCKER,
  WS_SUBSCRIBE_CHANNEL,
  WS_BLOCK_FRIEND
} = require("../../../config/constants");

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
        /* -------------------------------------------------------------------------- */
        /*                                   FRIEND                                   */
        /* -------------------------------------------------------------------------- */

        // REWORK, subscribe both users
        // HAVE TO PUBLISH TWICE FOR BOTH USERS?
        if (oldType === friendFirstSecond || oldType === friendSecondFirst) {
          await updateUserRelationship(
            { firstUserId, secondUserId, type: friendBoth },
            client
          );
          const channel = await addChannel({ type: "friend" }, client);
          await addMembers(
            { channelId: channel.id, userIds: [firstUserId, secondUserId] },
            client
          );
          const users = await getUsers({ userIds: [fromUser, toUser] }, client);
          channel.members = Object.keys(users);
          const messages = [];

          await client.query("COMMIT");

          res.status(201).json({
            userId: toUser,
            channelId: channel.id,
            channel,
            users,
            messages
          });

          publisher({
            type: WS_SUBSCRIBE_CHANNEL,
            userId: fromUser,
            channelId: channel.id,
            payload: {
              userId: fromUser,
              channelId: channel.id,
              type: "friend"
            }
          });

          publisher({
            type: WS_ADD_FRIEND,
            userId: toUser,
            channelId: channel.id,
            payload: {
              userId: fromUser,
              channelId: channel.id,
              type: "friend",
              channel,
              users,
              messages
            }
          });
        } else if (!oldType) {
          await addUserRelationship({ fromUser, toUser, type: friend }, client);
          const userInfo = await getUser({ userId: fromUser }, client);

          await client.query("COMMIT");

          res.status(201).json({
            userId: toUser
          });

          publisher({
            type: WS_ADD_RECEIVED_FRIEND_REQUEST,
            userId: toUser,
            payload: {
              userId: fromUser,
              user: {
                id: userInfo.id,
                username: userInfo.username,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                avatar: userInfo.avatar
              }
            }
          });
        }
      } else if (type === unfriend) {
        /* -------------------------------------------------------------------------- */
        /*                                  UNFRIEND                                  */
        /* -------------------------------------------------------------------------- */
        let sendType;
        let channelId;

        if (
          oldType === friendFirstSecond ||
          oldType === friendSecondFirst ||
          oldType === friendBoth
        ) {
          await deleteUserRelationship({ firstUserId, secondUserId }, client);
        }

        if (oldType === friendFirstSecond || oldType === friendSecondFirst) {
          if (
            (fromUser > toUser && oldType === friendSecondFirst) ||
            (fromUser < toUser && oldType === friendFirstSecond)
          ) {
            sendType = WS_DELETE_RECEIVED_FRIEND_REQUEST;
          } else if (
            (fromUser > toUser && oldType === friendFirstSecond) ||
            (fromUser < toUser && oldType === friendSecondFirst)
          ) {
            sendType = WS_DELETE_SENT_FRIEND_REQUEST;
          }
        } else if (oldType === friendBoth) {
          const room = await getFriendRoomId(
            { userId1: firstUserId, userId2: secondUserId },
            client
          );
          deleteChannel({ channelId: room.channelId }, client);

          channelId = room.channelId;

          sendType = WS_UNFRIEND;
        }

        await client.query("COMMIT");

        res.status(201).json({
          userId: toUser,
          channelId
        });

        publisher({
          type: sendType,
          userId: toUser,
          channelId,
          payload: {
            userId: fromUser,
            channelId
          }
        });
      } else if (type === block) {
        /* -------------------------------------------------------------------------- */
        /*                                    BLOCK                                   */
        /* -------------------------------------------------------------------------- */
        let channelId;
        let publisherPayload;
        let user;

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

        const userInfo = await getUser({ userId: toUser }, client);

        if (oldType === friendBoth) {
          const room = await getFriendRoomId(
            { userId1: firstUserId, userId2: secondUserId },
            client
          );
          await deleteChannel({ channelId: room.channelId }, client);
          channelId = room.channelId;

          publisherPayload = {
            type: WS_BLOCK_FRIEND,
            channelId,
            userId: toUser,
            payload: {
              userId: fromUser,
              channelId
            }
          };
        } else {
          publisherPayload = {
            type: WS_ADD_BLOCKER,
            userId: toUser,
            payload: {
              userId: fromUser
            }
          };
        }

        await client.query("COMMIT");

        res.status(201).json({
          userId: toUser,
          channelId,
          user: {
            id: userInfo.id,
            username: userInfo.username,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            avatar: userInfo.avatar
          }
        });

        publisher(publisherPayload);
      } else if (type === unblock) {
        /* -------------------------------------------------------------------------- */
        /*                                   UNBLOCK                                  */
        /* -------------------------------------------------------------------------- */
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

        await client.query("COMMIT");

        res.status(201).json({
          userId: toUser
        });

        publisher({
          type: WS_DELETE_BLOCKER,
          userId: toUser,
          payload: {
            userId: fromUser
          }
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
