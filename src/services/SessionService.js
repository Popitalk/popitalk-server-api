const bcrypt = require("bcryptjs");
const db = require("../config/database");

module.exports.login = async ({ usernameOrEmail, password }) => {
  return db.task(async t => {
    const user = await t.UserRepository.getUser({
      usernameOrEmail,
      withPassword: true
    });

    if (!user || !(await bcrypt.compare(password, user.password))) return false;

    const loginData = await t.SessionRepository.getLoginData({
      userId: user.id
    });

    return loginData;
  });
};

module.exports.getLoginData = async ({ userId }) => {
  return db.SessionRepository.getLoginData({ userId });
};
