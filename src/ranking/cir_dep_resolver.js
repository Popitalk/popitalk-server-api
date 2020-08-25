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

    // combine stuff
    loginData.channels = {
      ...loginData.channels,
      ...trendingChannels,
      ...discoverChannels
    };
    loginData.users = {
      ...loginData.users,
      ...trendingChannelsUsers,
      ...discoverChannelsUsers
    };
    return loginData;
  });
};
