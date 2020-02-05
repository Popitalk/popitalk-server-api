const Redis = require("ioredis");
const config = require(".");
const redis = require("./redis");
const { websocketsOfUsers, usersOfChannels } = require("./state");
const { userEvents, channelsEvents, channelEvents } = require("./constants");
const sender = require("../websockets/sender");

const pub = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

const subscriber = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

subscriber.subscribe(config.serverId);

subscriber.on("message", async (channel, message) => {
  const parsedMessage = JSON.parse(message);
  const messageType = parsedMessage.type;
  const messagePayload = parsedMessage.payload;

  sender(messageType, messagePayload);
});

const publisher = async ({ type, channelId, userId, payload }) => {
  if (userEvents.includes(type)) {
    const serverIdOfUser = await redis.get(userId);

    await pub.publish(
      serverIdOfUser,
      JSON.stringify({
        type,
        payload
      })
    );
  } else if (channelEvents.includes(type)) {
    const serverIdsOfChannel = await redis.smembers(channelId);

    for await (const sid of serverIdsOfChannel) {
      await pub.publish(
        sid,
        JSON.stringify({
          type,
          payload
        })
      );
    }
  } else if (channelsEvents.includes(type)) {
    for await (const sid of config.allServerIds) {
      await pub.publish(
        sid,
        JSON.stringify({
          type,
          payload
        })
      );
    }
  }
};

module.exports = { pub, publisher };
