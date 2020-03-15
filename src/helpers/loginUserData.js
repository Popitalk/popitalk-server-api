const getLoginData = require("../database/queries/getLoginData");

module.exports = async ({ userId }) => {
  const response = await getLoginData({ userId });

  return response;
};
