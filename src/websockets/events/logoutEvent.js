/* eslint-disable no-param-reassign */
const { serverId } = require("../../config");
const { channelsState, usersState } = require("../../config/state");
// const redis = require("../../config/redis");
const { subscriber } = require("../../config/pubSub");

const logoutEvent = async userId => {
  for await (const cid of usersState.get(userId).entries()) {
    // ... broadcast
  }

  // #1
  // Broadcast offline status to all friend channels
  // #2 and #3
  // const pipeline = redis.pipeline();

  for await (const cid of usersState.get(userId).keys()) {
    if (channelsState.has(cid)) {
      channelsState.get(cid).delete(userId);

      if (channelsState.get(cid).size === 0) {
        channelsState.delete(cid);
        // await pipeline.srem(cid, serverId);
        subscriber.unsubscribe(cid);
      }
    }
  }

  // #4
  // await pipeline.del(userId, serverId);
  // 5
  subscriber.unsubscribe(userId);
  usersState.delete(userId);
  // websocketsOfUsers.delete(userId);

  // await pipeline.exec();
};

module.exports = logoutEvent;
