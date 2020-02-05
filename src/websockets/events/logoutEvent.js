/* eslint-disable no-param-reassign */
const { serverId } = require("../../config");
const { usersOfChannels, channelsOfUsers } = require("../../config/state");
const redis = require("../../config/redis");

const logoutEvent = async userId => {
  for await (const cid of channelsOfUsers.get(userId).entries()) {
    // ... broadcast
  }

  // #1
  // Broadcast offline status to all friend channels
  // #2 and #3
  const pipeline = redis.pipeline();

  for await (const cid of channelsOfUsers.get(userId).keys()) {
    if (usersOfChannels.has(cid)) {
      usersOfChannels.get(cid).delete(userId);

      if (usersOfChannels.get(cid).size === 0) {
        usersOfChannels.delete(cid);
        await pipeline.srem(cid, serverId);
      }
    }
  }

  // #4
  await pipeline.del(userId, serverId);
  // 5
  channelsOfUsers.delete(userId);
  // websocketsOfUsers.delete(userId);

  await pipeline.exec();
};

module.exports = logoutEvent;
