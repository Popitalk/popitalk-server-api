const bcrypt = require("bcryptjs");
const db = require("../config/database");
const { getLoginData } = require("../ranking/cir_dep_resolver");

module.exports.login = async ({ usernameOrEmail, password }) => {
  return db.task(async t => {
    const user = await t.UserRepository.getUser({
      usernameOrEmail,
      withPassword: true
    });

    if (!user || !(await bcrypt.compare(password, user.password))) return false;

    const loginData = await getLoginData({ userId: user.id });

    return loginData;
  });
};

module.exports.getLoginData = async ({ userId }) => {
  return db.SessionRepository.getLoginData({ userId });
};
