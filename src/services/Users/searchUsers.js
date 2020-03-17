const { ApiError } = require("../../helpers/errors");
const getSearchedUsers = require("../../database/queries/getSearchedUsers");

const searchUsers = async ({ username }) => {
  const users = await getSearchedUsers({ username });
  if (!users) throw new ApiError(`No users found`, 404);
  return users;
};

module.exports = searchUsers;
