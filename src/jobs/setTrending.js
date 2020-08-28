const redis = require("../config/redis.js");
const ChannelService = require("../services/ChannelService.js");

module.exports = async () => {
  const listOfActiveChannels = await redis.keys("channel:*");

  let listOfChannels = [];
  listOfChannels = listOfActiveChannels.map(channel => channel.slice(8));
  if (listOfChannels.length < 6) {
    await redis.del("trending");
    return;
  }

  // sorting out top 36
  const promises = await listOfChannels.map(async channelKey => {
    const requestCount = await redis.get(`channel:${channelKey}`);
    return {
      id: channelKey,
      reqCount: parseInt(requestCount, 10) || 0
    };
  });
  let top36Channels = await Promise.all(promises);
  top36Channels = top36Channels.sort((a, b) => b.reqCount - a.reqCount);
  top36Channels = top36Channels.slice(0, 36);

  const top36ChannelScoresPromises = top36Channels.map(async item => {
    const channelId = item.id;
    const averagePostLikes = await ChannelService.getAvgPostLikesInLast50Hrs({
      channelId
    });
    const averageCommentCount = await ChannelService.getAvgCommentInLast50Hrs({
      channelId
    });
    const averageFollowRequests = await ChannelService.getCountFollowRequestsInLast50Hrs(
      { channelId }
    );
    return {
      ...item,
      score:
        averagePostLikes ** 1 +
        averageCommentCount ** 1.5 +
        averageFollowRequests ** 2
    };
  });
  let top36ChannelScores = await Promise.all(top36ChannelScoresPromises);
  top36ChannelScores = top36ChannelScores.sort((a, b) => b.score - a.score);

  const top36ChannelIds = top36ChannelScores.map(channel => channel.id);

  const _ = await redis.del("trending");
  redis.rpush("trending", top36ChannelIds);
};
