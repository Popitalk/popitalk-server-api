/* eslint-disable no-param-reassign */
const { serverId, heartbeatInterval } = require("../../config");
const {
  websocketsOfUsers,
  usersOfChannels,
  channelsOfUsers
} = require("../../config/state");
const { HELLO, PING } = require("../../config/constants");
const redis = require("../../config/redis");

const loginEvent = async (ws, request) => {
  const userId = request.session.passport.user;
  // #1
  const pipeline = redis.pipeline();
  await pipeline.set(userId, serverId);
  // #2
  websocketsOfUsers.set(userId, ws);
  // #3
  const allChannels = request.session.user.channels;
  if (allChannels) {
    channelsOfUsers.set(userId, new Map());

    Object.entries(allChannels).forEach(([channelId, channel]) => {
      channelsOfUsers.get(userId).set(channelId, channel.type);
    });
  }
  // #4 and #5
  for await (const cid of channelsOfUsers.get(userId).keys()) {
    await pipeline.sadd(cid, serverId);

    if (!usersOfChannels.has(cid)) {
      usersOfChannels.set(cid, new Set());
    }

    usersOfChannels.get(cid).add(userId);
  }

  await pipeline.exec();
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
