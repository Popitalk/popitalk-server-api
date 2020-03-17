const { ApiError } = require("../../helpers/errors");
const getUserDb = require("../../database/queries/getUser");

const getUser = async ({ userId }) => {
  const user = await getUserDb({ userId });

  if (!user) throw new ApiError(`User with id ${userId} not found`, 404);

  return user;
};

module.exports = getUser;
