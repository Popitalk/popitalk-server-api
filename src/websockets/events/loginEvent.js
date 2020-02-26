/* eslint-disable no-param-reassign */
const { serverId, heartbeatInterval } = require("../../config");
const {
  websocketsOfUsers,
  channelsState,
  usersState
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

  // console.log("XXX", userId, allChannels);
  if (allChannels) {
    usersState.set(userId, new Map());

    Object.entries(allChannels).forEach(([channelId, channel]) => {
      usersState.get(userId).set(channelId, channel.type);
    });

    for await (const cid of usersState.get(userId).keys()) {
      // await pipeline.sadd(cid, serverId);

      if (!channelsState.has(cid)) {
        channelsState.set(cid, new Set());
        subscriber.subscribe(cid);
      }

      channelsState.get(cid).add(userId);
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
