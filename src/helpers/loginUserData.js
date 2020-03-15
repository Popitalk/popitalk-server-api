const getLoginData = require("../database/queries/getLoginData");
const redis = require("../config/redis");

module.exports = async ({ userId }) => {
  const response = await getLoginData({ userId });

  if (response.channels) {
    const allChannels = Object.entries(response.channels).map(
      ([channelId, channel]) => ({
        channelId,
        channelType: channel.type
      })
    );

    for await (const { channelId, channelType } of allChannels) {
      if (channelType === "friend") {
        const subChannel = await redis.pubsub("NUMSUB", channelId);
        if (subChannel[1] !== 0) {
          response.channels[channelId].online = true;
        }
      }
    }
  }

  return response;
};
