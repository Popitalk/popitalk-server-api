const { inspect } = require("util");
const getUser = require("../database/queries/getUser");
const getUsersAndRelationships = require("../database/queries/getUsersAndRelationships");
const getChannels = require("../database/queries/getChannels");
const getLoginData = require("../database/queries/getLoginData");
const formatUsersAndRelationships = require("./formatUsersAndRelationships");

module.exports = async ({ userId, validatePassword = true }) => {
  // let response;
  const relationships = {};
  const channels = {};
  const users = {}; // Only for rooms and friends and sent friend requests

  const response = await getLoginData({ userId });

  console.log("=======");
  console.log("=======");
  console.log(inspect(response, { colors: true, depth: 5 }));
  console.log("=======");
  console.log("=======");

  // const user = await getUser({ userId });

  // if (user) {
  //   const usersAndRelationships = await getUsersAndRelationships({
  //     userId: user.id
  //   });

  //   response = {
  //     ...user,
  //     ...response
  //   };

  //   if (usersAndRelationships) {
  //     const formattedUsersAndRelationships = formatUsersAndRelationships(
  //       user.id,
  //       usersAndRelationships
  //     );
  //     response = {
  //       ...response,
  //       relationships: formattedUsersAndRelationships.relationships,
  //       users: formattedUsersAndRelationships.users
  //     };
  //   }

  //   const { channels } = await getChannels({ userId: user.id });

  //   if (channels) {
  //     Object.entries(channels).forEach(([channelId, channel]) => {
  //       if (channel.users) {
  //         const usersIds = Object.keys(channel.users);

  //         response.users = {
  //           ...response.users,
  //           ...channel.users
  //         };

  //         channels[channelId].users = usersIds;
  //       }
  //     });

  //     response = {
  //       ...response,
  //       channels
  //     };
  //   }

  return true;
  // return response;
  // }
};
