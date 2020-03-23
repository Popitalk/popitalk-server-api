const db = require("../config/database");

module.exports.getLoginData = async ({ userId }) => {
  return db.SessionRepository.getLoginData({ userId });
};
