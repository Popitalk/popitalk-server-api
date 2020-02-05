/* eslint-disable no-param-reassign */
const { serverId, heartbeatInterval } = require("../../config");
const {
  websocketsOfUsers,
  usersOfChannels,
  channelsOfUsers
} = require("../../config/state");
const { HELLO, PING } = require("../../config/constants");
const redis = require("../../config/redis");
const { subscriber } = require("../../config/pubSub");

const loginEvent = async (ws, request) => {
  const userId = request.session.passport.user;
  // #1
  subscriber.subscribe(userId);
  websocketsOfUsers.set(userId, ws);
  // const pipeline = redis.pipeline();
  // await pipeline.set(userId, serverId);
  // #2

  // #3
  const allChannels = request.session.user.channels;
  if (allChannels) {
    channelsOfUsers.set(userId, new Map());

    Object.entries(allChannels).forEach(([channelId, channel]) => {
      channelsOfUsers.get(userId).set(channelId, channel.type);
    });

    for await (const cid of channelsOfUsers.get(userId).keys()) {
      // await pipeline.sadd(cid, serverId);

      if (!usersOfChannels.has(cid)) {
        usersOfChannels.set(cid, new Set());
        subscriber.subscribe(cid);
      }

      usersOfChannels.get(cid).add(userId);
    }
  }
  // #4 and #5

  // await pipeline.exec();
  // #6
  // Publish here (online status to friends room)
  // #7
  ws.isAlive = true;
  ws.send(
    JSON.stringify({
      type: HELLO,
      payload: {
        heartbeatInterval: Number(heartbeatInterval)
      }
    })
  );
};

module.exports = loginEvent;
