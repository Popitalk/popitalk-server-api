const redis = require("../config/redis.js");
const ChannelService = require("../services/ChannelService.js");

module.exports = async ({ userId }) => {
  const top6ChannelIds = await redis.lrange("trending", 0, 5);
  if (top6ChannelIds.length < 3) {
    return {
      trendingChannels: [],
      trendingChannelsUsers: []
    };
  }
  const top6ChannelsPromises = top6ChannelIds.map(async channelId => {
    const channelInfoStr = await redis.get(channelId);
    let channelInfo;

    if (channelInfoStr === null) {
      try {
        channelInfo = await ChannelService.getChannel({ channelId, userId });
        redis.set(channelId, JSON.stringify(channelInfo), "EX", 30);
      } catch {
        return {};
      }
    } else {
      channelInfo = JSON.parse(channelInfoStr);
    }
    return {
      [channelId]: {
        ...channelInfo
      }
    };
  });
  const top6ChannelsArray = await Promise.all(top6ChannelsPromises);
  let top6Channels;
  let top6ChannelsUsers;
  top6ChannelsArray.forEach(channel => {
    try {
      top6Channels = {
        ...top6Channels,
        [channel[Object.keys(channel)[0]].channel.id]: {
          ...channel[Object.keys(channel)[0]].channel,
          queue: channel[Object.keys(channel)[0]].queue,
          speciality: "trending"
        }
      };
      top6ChannelsUsers = {
        ...top6ChannelsUsers,
        ...channel[Object.keys(channel)[0]].users
      };
    } catch {}
  });
  return {
    trendingChannels: top6Channels,
    trendingChannelsUsers: top6ChannelsUsers
  };
};
