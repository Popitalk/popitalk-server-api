const db = require("../config/database");
const { getTrending, getDiscover } = require("./ranker");

module.exports.getLoginData = async ({ userId }) => {
  return db.task(async t => {
    const loginData = await t.SessionRepository.getLoginData({ userId });
    const { trendingChannels, trendingChannelsUsers } = await getTrending({
      userId
    });
    const { discoverChannels, discoverChannelsUsers } = await getDiscover({
      userId
    });

    const trendingKeys = Object.keys(trendingChannels);
    const discoverKeys = Object.keys(discoverChannels);
    const discoverChannels6 = {};
    discoverKeys.forEach(discoverKey => {
      if (
        !trendingKeys.includes(discoverKey) &&
        Object.keys(discoverChannels6).length < 6
      ) {
        discoverChannels6[discoverKey] = discoverChannels[discoverKey];
      }
    });

    // combine stuff
    loginData.channels = {
      ...loginData.channels,
      ...discoverChannels6,
      ...trendingChannels
    };
    loginData.users = {
      ...loginData.users,
      ...discoverChannelsUsers,
      ...trendingChannelsUsers
    };
    return loginData;
  });
};
