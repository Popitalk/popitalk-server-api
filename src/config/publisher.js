/* eslint-disable prefer-const */
const Redis = require("ioredis");
const config = require(".");

const {
  USER_EVENTS,
  CHANNEL_EVENTS,
  USER_CHANNEL_EVENTS,
  CHANNELS_EVENTS
} = require("./constants");

const pub = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

module.exports = async ({ type, initiator, channelId, userId, payload }) => {
  if (USER_EVENTS[type]) {
    pub.publish(
      userId,
      JSON.stringify({
        userId,
        channelId,
        type,
        payload
      })
    );
  } else if (CHANNEL_EVENTS[type]) {
    pub.publish(
      channelId,
      JSON.stringify({
        channelId,
        type,
        payload,
        initiator
      })
    );
  }
  if (USER_CHANNEL_EVENTS[type]) {
    if (type === USER_CHANNEL_EVENTS.WS_JOIN_CHANNEL) {
      pub.publish(
        userId,
        JSON.stringify({
          type: USER_EVENTS.WS_SUBSCRIBE_CHANNEL,
          userId,
          payload
        })
      );
      pub.publish(
        channelId,
        JSON.stringify({
          type: CHANNEL_EVENTS.WS_ADD_MEMBER,
          channelId,
          payload,
          initiator
        })
      );
    } else if (type === USER_CHANNEL_EVENTS.WS_LEAVE_CHANNEL) {
      if (!payload.public) {
        pub.publish(
          userId,
          JSON.stringify({
            type: USER_EVENTS.WS_UNSUBSCRIBE_CHANNEL,
            userId,
            payload
          })
        );
      }
      pub.publish(
        channelId,
        JSON.stringify({
          type: CHANNEL_EVENTS.WS_DELETE_MEMBER,
          channelId,
          payload,
          initiator
        })
      );
    } else if (type === USER_CHANNEL_EVENTS.WS_UNFRIEND) {
      pub.publish(
        channelId,
        JSON.stringify({
          type: CHANNEL_EVENTS.WS_DELETE_FRIEND_ROOM,
          channelId,
          payload
        })
      );
      pub.publish(
        userId,
        JSON.stringify({
          type: USER_EVENTS.WS_DELETE_FRIEND,
          userId,
          payload
        })
      );
    } else if (type === USER_CHANNEL_EVENTS.WS_BLOCK_FRIEND) {
      pub.publish(
        channelId,
        JSON.stringify({
          type: CHANNEL_EVENTS.WS_DELETE_FRIEND_ROOM,
          channelId,
          payload
        })
      );
      pub.publish(
        userId,
        JSON.stringify({
          type: USER_EVENTS.WS_ADD_BLOCKER,
          userId,
          payload
        })
      );
    }
  } else if (CHANNELS_EVENTS[type]) {
    console.log("channelsEvents");
  }
};
